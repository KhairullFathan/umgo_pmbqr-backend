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
	processBotMessage
} from "../services/bot.processor.js";

import {
	claimSequence,
	advanceSequence,
	releaseChatLock,
	skipSequence
} from "../services/chat.order.service.js";

const workerId =
	randomUUID();

console.log(
	`[Worker] ID: ${workerId}`
);

const worker =
	new Worker(
		"whatsapp-messages",

		async (job) => {

			const {
				chatId,
				message,
				session,
				sequence
			} = job.data;

			console.log("====================================");
			console.log("BOT WORKER");
			console.log("Worker   :", workerId);
			console.log("Job ID   :", job.id);
			console.log("Chat     :", chatId);
			console.log("Sequence :", sequence);
			console.log("Message  :", message);

			/*
			|--------------------------------------------------------------------------
			| CLAIM
			|--------------------------------------------------------------------------
			*/

			const claimed =
				await claimSequence(
					chatId,
					sequence,
					workerId,
					300
				);

			if (!claimed) {

				console.log(
					`[Ordering] Sequence ${sequence} WAIT`
				);

				throw new Error(
					`MESSAGE_ORDER_WAIT:${chatId}:${sequence}`
				);
			}

			console.log(
				`[Ordering] Sequence ${sequence} claimed`
			);

			try {

				/*
				|--------------------------------------------------------------------------
				| PROCESS BOT
				|--------------------------------------------------------------------------
				*/

				const result =
					await processBotMessage({
						chatId,
						message,
						session
					});

				/*
				|--------------------------------------------------------------------------
				| ADVANCE
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
					`[Ordering] Sequence ${sequence} advanced`
				);

				return {
					success: true,
					sequence,
					rule: result.rule
				};

			} finally {

				/*
				|--------------------------------------------------------------------------
				| RELEASE LOCK
				|--------------------------------------------------------------------------
				*/

				const released =
					await releaseChatLock(
						chatId,
						workerId
					);

				console.log(
					`[Ordering] Lock released: ${released}`
				);

				console.log(
					"===================================="
				);
			}
		},

		{
			connection:
				redisConnection,

			concurrency: 5
		}
	);

/*
|--------------------------------------------------------------------------
| COMPLETED
|--------------------------------------------------------------------------
*/

worker.on(
	"completed",
	(job) => {

		console.log(
			`[Worker] Job ${job.id} completed`
		);
	}
);

/*
|--------------------------------------------------------------------------
| FAILED
|--------------------------------------------------------------------------
*/

worker.on(
	"failed",
	async (job, error) => {

		console.error(
			`[Worker] Job ${job?.id} failed:`,
			error.message
		);

		if (!job) {
			return;
		}

		/*
		|--------------------------------------------------------------------------
		| ORDER WAIT
		|--------------------------------------------------------------------------
		|
		| Jangan skip sequence.
		|
		*/

		if (
			error.message.startsWith(
				"MESSAGE_ORDER_WAIT:"
			)
		) {

			console.log(
				`[Ordering] Job ${job.id} masih menunggu sequence sebelumnya`
			);

			return;
		}

		/*
		|--------------------------------------------------------------------------
		| REAL FAILURE
		|--------------------------------------------------------------------------
		*/

		if (
			job.attemptsMade >=
			(job.opts.attempts || 1)
		) {

			const {
				chatId,
				sequence
			} = job.data;

			console.error(
				`[Ordering] Processing failed permanently`
			);

			console.error(
				`[Ordering] Skipping sequence ${sequence}`
			);

			await skipSequence(
				chatId,
				sequence
			);
		}
	}
);

/*
|--------------------------------------------------------------------------
| WORKER ERROR
|--------------------------------------------------------------------------
*/

worker.on(
	"error",
	(error) => {

		console.error(
			"[Worker] Error:",
			error
		);
	}
);

/*
|--------------------------------------------------------------------------
| START
|--------------------------------------------------------------------------
*/

console.log("====================================");
console.log("BOT WORKER STARTED");
console.log("Queue       : whatsapp-messages");
console.log("Concurrency : 5");
console.log("Ordering    : PER CHAT");
console.log("Lock        : REDIS ATOMIC");
console.log("Lock TTL    : 300 seconds");
console.log("Worker ID   :", workerId);
console.log("====================================");