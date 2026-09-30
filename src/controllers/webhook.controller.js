import { botQueue } from "../services/bot.queue.js";

import {
	getNextSequence
} from "../services/chat.order.service.js";

import {
	claimMessageId,
	releaseMessageId,
	createInboundMessage
} from "../services/message.service.js";


export async function handleWahaWebhook(req, res) {

	try {

		const {
			event,
			session,
			payload
		} = req.body;


		console.log("====================================");
		console.log("WAHA WEBHOOK RECEIVED");
		console.log("Event   :", event);
		console.log("Session :", session);


		/*
		|--------------------------------------------------------------------------
		| 1. Ignore event selain "message"
		|--------------------------------------------------------------------------
		*/

		if (event !== "message") {

			console.log(
				"Event ignored"
			);

			console.log("====================================");

			return res.status(200).json({
				success: true,
				message: "Event ignored"
			});
		}


		/*
		|--------------------------------------------------------------------------
		| 2. Pastikan payload tersedia
		|--------------------------------------------------------------------------
		*/

		if (!payload) {

			console.log(
				"Message payload missing"
			);

			console.log("====================================");

			return res.status(200).json({
				success: true,
				message:
					"Message payload missing"
			});
		}


		/*
		|--------------------------------------------------------------------------
		| 3. Abaikan pesan yang dikirim oleh bot sendiri
		|--------------------------------------------------------------------------
		|
		| WAHA juga mengirim webhook untuk pesan OUTBOUND.
		|
		| Contoh:
		|
		| fromMe: true
		|
		| Pesan seperti ini tidak boleh masuk ke pipeline
		| inbound karena dapat menyebabkan bot merespons dirinya sendiri.
		|
		*/

		if (payload.fromMe === true) {

			console.log(
				"Outgoing message ignored"
			);

			console.log(
				"Message ID:",
				payload.id
			);

			console.log("====================================");

			return res.status(200).json({
				success: true,
				ignored: true,
				reason: "MESSAGE_FROM_ME",
				message_id: payload.id || null
			});
		}


		/*
		|--------------------------------------------------------------------------
		| 4. Ambil data pesan
		|--------------------------------------------------------------------------
		|
		| Berdasarkan payload WAHA aktual:
		|
		| payload.id   -> message ID
		| payload.from -> chat ID
		| payload.body -> isi pesan
		|
		*/

		const messageId =
			payload.id;

		const chatId =
			payload.from;

		const message =
			typeof payload.body === "string"
				? payload.body.trim()
				: "";


		console.log(
			"Message ID:",
			messageId
		);

		console.log(
			"From      :",
			chatId
		);

		console.log(
			"Message   :",
			message
		);


		/*
		|--------------------------------------------------------------------------
		| 5. Validasi data message
		|--------------------------------------------------------------------------
		*/

		if (
			!messageId ||
			!chatId ||
			!message
		) {

			console.log(
				"Message data incomplete"
			);

			console.log("====================================");

			return res.status(200).json({
				success: true,
				message:
					"Message data incomplete"
			});
		}


		/*
		|--------------------------------------------------------------------------
		| 6. Claim message ID menggunakan Redis
		|--------------------------------------------------------------------------
		|
		| Redis SET NX digunakan sebagai fast idempotency gate.
		|
		| Hanya webhook pertama yang akan mendapatkan claim.
		|
		*/

		const claimed =
			await claimMessageId(
				messageId,
				60
			);


		if (!claimed) {

			console.log(
				`[Webhook] Duplicate detected: ${messageId}`
			);

			console.log("====================================");

			return res.status(200).json({
				success: true,
				duplicate: true,
				message_id: messageId
			});
		}


		/*
		|--------------------------------------------------------------------------
		| 7. Generate sequence per chat
		|--------------------------------------------------------------------------
		|
		| Sequence dibuat setelah message berhasil mendapatkan
		| idempotency claim.
		|
		| Dengan demikian duplicate webhook tidak menghasilkan
		| sequence tambahan.
		|
		*/

		const sequence =
			await getNextSequence(
				chatId
			);


		console.log(
			"Sequence  :", sequence
		);


		/*
		|--------------------------------------------------------------------------
		| 8. Simpan inbound message ke database
		|--------------------------------------------------------------------------
		*/

		const result =
			await createInboundMessage({
				messageId,
				chatId,
				message,
				sequence,
				session,
				receivedAt:
					payload.timestamp
						? new Date(
							Number(
								payload.timestamp
							) * 1000
						)
						: new Date()
			});


		/*
		|--------------------------------------------------------------------------
		| 9. Database mendeteksi duplicate
		|--------------------------------------------------------------------------
		|
		| Ini merupakan second layer protection.
		|
		| Redis adalah fast gate.
		| MySQL UNIQUE(message_id) adalah final guarantee.
		|
		*/

		if (result.duplicate) {

			await releaseMessageId(
				messageId
			);

			console.log(`[Webhook] Database duplicate: ${messageId}`);
			console.log("====================================");
			return res.status(200).json({
				success: true,
				duplicate: true,
				message_id: messageId
			});
		}


		/*
		|--------------------------------------------------------------------------
		| 10. Masukkan message ke BullMQ
		|--------------------------------------------------------------------------
		*/

		let job;
		try {
			job =
				await botQueue.add(
					"process-message",
					{
						messageId,
						chatId,
						message,
						session,
						payload,
						sequence
					}
				);
		} catch (queueError) {

			/*
			|--------------------------------------------------------------------------
			| Queue gagal
			|--------------------------------------------------------------------------
			|
			| Message sudah tersimpan di database.
			|
			| Kita tidak menghapus message karena database harus
			| tetap menjadi record penerimaan pesan.
			|
			| Status tetap RECEIVED dan nantinya dapat direcovery
			| oleh mekanisme recovery queue.
			|
			*/

			console.error("[Webhook] Failed to add job to queue");
			console.error(queueError);
			await releaseMessageId(messageId);
			return res.status(500).json({
				success: false,
				message:
					"Message received but failed to queue"
			});
		}


		/*
		|--------------------------------------------------------------------------
		| 11. Message berhasil masuk queue
		|--------------------------------------------------------------------------
		*/

		await result.record.update({status: "QUEUED"});

		console.log("Job ID    :", job.id);
		console.log("Queued    : YES");
		console.log("====================================");


		/*
		|--------------------------------------------------------------------------
		| 12. Response ke WAHA
		|--------------------------------------------------------------------------
		*/

		return res.status(200).json({
			success: true,
			queued: true,
			duplicate: false,
			message_id: messageId,
			job_id: job.id,
			sequence
		});

	} catch (error) {
		console.error("====================================");
		console.error("Webhook error:");
		console.error(error);
		console.error("====================================");
		return res.status(500).json({
			success: false,
			message: "Webhook processing failed"
		});
	}
}