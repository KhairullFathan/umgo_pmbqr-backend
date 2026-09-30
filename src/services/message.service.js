import {
	redisConnection
} from "../config/redis.js";

import {
	BotMessage
} from "../models/index.js";


function normalizeMessageId(
	messageId
) {

	return messageId
		.replace(
			/[^a-zA-Z0-9_-]/g,
			"_"
		);
}


function idempotencyKey(
	messageId
) {

	return (
		`message:idempotency:` +
		normalizeMessageId(messageId)
	);
}


export async function claimMessageId(
	messageId,
	ttl = 60
) {

	const result =
		await redisConnection.set(
			idempotencyKey(messageId),
			"1",
			"NX",
			"EX",
			ttl
		);


	return result === "OK";
}


export async function releaseMessageId(
	messageId
) {

	await redisConnection.del(
		idempotencyKey(messageId)
	);
}


export async function findMessageById(
	messageId
) {

	return await BotMessage.findOne({
		where: {
			message_id: messageId
		}
	});
}


export async function createInboundMessage({
	messageId,
	chatId,
	message,
	sequence,
	session,
	receivedAt = new Date()
}) {

	try {

		const record =
			await BotMessage.create({

				message_id:
					messageId,

				chat_id:
					chatId,

				sequence,

				direction:
					"INBOUND",

				message,

				status:
					"RECEIVED",

				session,

				received_at:
					receivedAt
			});


		return {
			created: true,
			duplicate: false,
			record
		};


	} catch (error) {

		if (
			error.name ===
			"SequelizeUniqueConstraintError"
		) {

			const existing =
				await findMessageById(
					messageId
				);


			return {
				created: false,
				duplicate: true,
				record: existing
			};
		}


		throw error;
	}
}