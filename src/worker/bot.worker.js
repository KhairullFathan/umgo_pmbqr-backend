import "dotenv/config";

import {
	randomUUID
} from "crypto";

import {
	Worker
} from "bullmq";

import {
	redisConnection
} from "../config/redis.js";

import {
	BotMessage,
	BotJob,
	BotLog
} from "../models/index.js";

import {
	processBotMessage
} from "../services/bot.processor.js";

import {
	claimSequence,
	advanceSequence,
	releaseChatLock,
	skipSequence
} from "../services/chat.order.service.js";


const QUEUE_NAME =
	"whatsapp-messages";

const WORKER_CONCURRENCY =
	Number(
		process.env.WORKER_CONCURRENCY || 5
	);

const LOCK_TTL =
	Number(
		process.env.WORKER_LOCK_TTL || 300
	);


const workerId =
	randomUUID();


/*
|--------------------------------------------------------------------------
| Logging Helper
|--------------------------------------------------------------------------
*/

async function createLog({
	messageId = null,
	jobId = null,
	event,
	data = null
}) {

	try {

		await BotLog.create({

			message_id:
				messageId,

			job_id:
				jobId,

			event,

			data

		});

	} catch (error) {

		/*
		|--------------------------------------------------------------------------
		| Logging tidak boleh membuat worker crash.
		|--------------------------------------------------------------------------
		*/

		console.error(
			"[Worker] Failed to create log"
		);

		console.error(
			error.message
		);
	}
}


/*
|--------------------------------------------------------------------------
| Update Message
|--------------------------------------------------------------------------
*/

async function updateMessage(
	messageId,
	data
) {

	const message =
		await BotMessage.findOne({

			where: {
				message_id:
					messageId
			}

		});


	if (!message) {

		throw new Error(
			`MESSAGE_NOT_FOUND:${messageId}`
		);

	}


	await message.update(
		data
	);


	return message;
}


/*
|--------------------------------------------------------------------------
| Update Job
|--------------------------------------------------------------------------
*/

async function updateJob(
	jobId,
	data
) {

	const job =
		await BotJob.findOne({

			where: {
				job_id:
					String(jobId)
			}

		});


	if (!job) {

		/*
		|--------------------------------------------------------------------------
		| Job belum tercatat di database.
		|--------------------------------------------------------------------------
		|
		| Ini bisa terjadi karena controller saat ini baru
		| memasukkan job ke BullMQ.
		|
		| Untuk worker, kita buat record jika belum tersedia.
		|
		*/

		return await BotJob.create({

			job_id:
				String(jobId),

			message_id:
				data.message_id,

			status:
				data.status ||
				"QUEUED",

			attempts:
				data.attempts ||
				0,

			error_message:
				data.error_message ||
				null,

			started_at:
				data.started_at ||
				null,

			completed_at:
				data.completed_at ||
				null

		});

	}


	await job.update(
		data
	);


	return job;
}


/*
|--------------------------------------------------------------------------
| Worker
|--------------------------------------------------------------------------
*/

const worker =
	new Worker(

		QUEUE_NAME,

		async job => {

			const {
				messageId,
				chatId,
				message,
				session,
				payload,
				sequence
			} = job.data;


			const jobId =
				String(job.id);


			/*
			|--------------------------------------------------------------------------
			| Worker identity
			|--------------------------------------------------------------------------
			*/

			const currentWorkerId =
				`${workerId}:${jobId}`;


			console.log(
				"========================================"
			);

			console.log(
				"[Worker] JOB STARTED"
			);

			console.log(
				"Worker   :",
				workerId
			);

			console.log(
				"Job ID   :",
				jobId
			);

			console.log(
				"Message  :",
				messageId
			);

			console.log(
				"Chat     :",
				chatId
			);

			console.log(
				"Sequence :",
				sequence
			);


			/*
			|--------------------------------------------------------------------------
			| 1. Claim sequence
			|--------------------------------------------------------------------------
			*/

			const claimed =
				await claimSequence(

					chatId,

					sequence,

					currentWorkerId,

					LOCK_TTL

				);


			if (!claimed) {

				console.log(
					`[Worker] Waiting for sequence ${sequence}`
				);


				throw new Error(
					`MESSAGE_ORDER_WAIT:${chatId}:${sequence}`
				);

			}


			/*
			|--------------------------------------------------------------------------
			| 2. Update Job → PROCESSING
			|--------------------------------------------------------------------------
			*/

			await updateJob(

				jobId,

				{
					message_id:
						messageId,

					status:
						"PROCESSING",

					attempts:
						job.attemptsMade + 1,

					started_at:
						new Date(),

					error_message:
						null
				}

			);


			/*
			|--------------------------------------------------------------------------
			| 3. Update Message → PROCESSING
			|--------------------------------------------------------------------------
			*/

			await updateMessage(

				messageId,

				{
					status:
						"PROCESSING"
				}

			);


			/*
			|--------------------------------------------------------------------------
			| 4. Log JOB_STARTED
			|--------------------------------------------------------------------------
			*/

			await createLog({

				messageId,

				jobId,

				event:
					"JOB_STARTED",

				data: {

					chat_id:
						chatId,

					sequence,

					attempt:
						job.attemptsMade + 1,

					worker_id:
						workerId

				}

			});


			/*
			|--------------------------------------------------------------------------
			| 5. Process bot
			|--------------------------------------------------------------------------
			*/

			const result =
				await processBotMessage({

					messageId,

					chatId,

					message,

					session,

					payload

				});

			await createLog({

				messageId,

				jobId,

				event:
						"OUTBOUND_PERSISTED",

				data: {

					chat_id:
						chatId,

					sequence,

					outbound_message_id:
						result.outboundMessageId,

					outbound_record_id:
						result.outboundRecordId,

					rule_id:
						result.rule_id,

					rule:
						result.rule

				}

		});


			/*
			|--------------------------------------------------------------------------
			| 6. Log MESSAGE_SENT
			|--------------------------------------------------------------------------
			*/

			await createLog({

				messageId,

				jobId,

				event:
					"MESSAGE_SENT",

				data: {

					chat_id:
						chatId,

					sequence,

					rule_id:
						result.rule_id,

					rule:
						result.rule,

					response:
						result.responseText,

					waha:
						result.waha || null

				}

			});


			/*
			|--------------------------------------------------------------------------
			| 7. Update inbound message
			|--------------------------------------------------------------------------
			*/

			await updateMessage(

				messageId,

				{
					status:
						"SENT",

					processed_at:
						new Date()

				}

			);


			/*
			|--------------------------------------------------------------------------
			| 8. Update job
			|--------------------------------------------------------------------------
			*/

			await updateJob(

				jobId,

				{

					message_id:
						messageId,

					status:
						"COMPLETED",

					attempts:
						job.attemptsMade + 1,

					completed_at:
						new Date(),

					error_message:
						null

				}

			);


			/*
			|--------------------------------------------------------------------------
			| 9. Log JOB_COMPLETED
			|--------------------------------------------------------------------------
			*/

			await createLog({

				messageId,

				jobId,

				event:
					"JOB_COMPLETED",

				data: {

					chat_id:
						chatId,

					sequence,

					rule_id:
						result.rule_id,

					rule:
						result.rule

				}

			});


			/*
			|--------------------------------------------------------------------------
			| 10. Advance sequence
			|--------------------------------------------------------------------------
			*/

			const advanced =
				await advanceSequence(

					chatId,

					sequence

				);


			if (!advanced) {

				throw new Error(
					`SEQUENCE_ADVANCE_FAILED:${chatId}:${sequence}`
				);

			}


			console.log(
				`[Worker] Sequence advanced: ${chatId} → ${sequence + 1}`
			);


			/*
			|--------------------------------------------------------------------------
			| Return
			|--------------------------------------------------------------------------
			*/

			console.log(
				"[Worker] JOB COMPLETED"
			);

			console.log(
				"========================================"
			);


			return {

				success:
					true,

				messageId,

				chatId,

				sequence,

				rule:
					result.rule,

				rule_id:
					result.rule_id

			};

		},

		{

			connection:
				redisConnection,

			concurrency:
				WORKER_CONCURRENCY

		}

	);


/*
|--------------------------------------------------------------------------
| Completed
|--------------------------------------------------------------------------
*/

worker.on(
	"completed",
	job => {

		console.log(
			`[Worker] BullMQ completed: ${job.id}`
		);

	}
);


/*
|--------------------------------------------------------------------------
| Failed
|--------------------------------------------------------------------------
*/

worker.on(
	"failed",
	async (job, error) => {

		if (!job) {
			return;
		}


		const {
			messageId,
			chatId,
			sequence
		} = job.data;


		/*
		|--------------------------------------------------------------------------
		| MESSAGE_ORDER_WAIT
		|--------------------------------------------------------------------------
		|
		| Jangan skip sequence.
		|
		| Job akan menggunakan retry BullMQ.
		|--------------------------------------------------------------------------
		*/

		if (
			error.message.startsWith(
				"MESSAGE_ORDER_WAIT:"
			)
		) {

			console.log(
				`[Worker] Sequence not ready: ${sequence}`
			);

			return;

		}


		/*
		|--------------------------------------------------------------------------
		| Apakah ini attempt terakhir?
		|--------------------------------------------------------------------------
		*/

		const attempts =
			job.opts.attempts ||
			1;

		const attemptNumber =
			job.attemptsMade;


		const finalFailure =
			attemptNumber >= attempts;


		/*
		|--------------------------------------------------------------------------
		| Log failure
		|--------------------------------------------------------------------------
		*/

		await createLog({

			messageId,

			jobId:
				String(job.id),

			event:
				finalFailure
					? "JOB_FAILED"
					: "JOB_RETRY",

			data: {

				chat_id:
					chatId,

				sequence,

				attempt:
					attemptNumber,

				max_attempts:
					attempts,

				error:
					error.message,

				stack:
					error.stack

			}

		});


		/*
		|--------------------------------------------------------------------------
		| Update bot_jobs
		|--------------------------------------------------------------------------
		*/

		await updateJob(

			String(job.id),

			{

				message_id:
					messageId,

				status:
					finalFailure
						? "FAILED"
						: "PROCESSING",

				attempts:
					attemptNumber,

				error_message:
					error.message,

				completed_at:
					finalFailure
						? new Date()
						: null

			}

		);


		/*
		|--------------------------------------------------------------------------
		| Update bot_messages
		|--------------------------------------------------------------------------
		*/

		if (finalFailure) {

			await updateMessage(

				messageId,

				{

					status:
						"FAILED",

					processed_at:
						new Date()

				}

			);


			/*
			|--------------------------------------------------------------------------
			| Skip sequence
			|--------------------------------------------------------------------------
			|
			| Hanya dilakukan jika job benar-benar gagal setelah
			| seluruh retry habis.
			|
			*/

			const skipped =
				await skipSequence(

					chatId,

					sequence

				);


			if (skipped) {

				console.log(
					`[Worker] Failed sequence skipped: ${chatId}:${sequence}`
				);

			} else {

				console.error(
					`[Worker] Failed to skip sequence: ${chatId}:${sequence}`
				);

			}

		}

	}
);


/*
|--------------------------------------------------------------------------
| Worker Error
|--------------------------------------------------------------------------
*/

worker.on(
	"error",
	error => {

		console.error(
			"[Worker] Worker error"
		);

		console.error(
			error
		);

	}
);


/*
|--------------------------------------------------------------------------
| Startup
|--------------------------------------------------------------------------
*/

console.log(`
========================================
 WhatsApp Bot Worker
========================================
Queue       : ${QUEUE_NAME}
Worker ID   : ${workerId}
Concurrency : ${WORKER_CONCURRENCY}
Lock TTL    : ${LOCK_TTL}s
========================================
`);