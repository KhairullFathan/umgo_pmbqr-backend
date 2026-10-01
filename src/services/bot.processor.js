import {
	sendText,
	extractWahaMessageId
} from "./waha.service.js";


import {
	findMatchingRule,
	getDefaultResponse
} from "./rule.service.js";


import {
	createOutboundMessage
} from "./outbound.message.service.js";


export async function processBotMessage({

	messageId,

	chatId,

	message,

	session,

	payload

}) {

	console.log(
		`[Bot] Processing ${chatId}: ${message}`
	);


	/*
	|--------------------------------------------------------------------------
	| TEST FAILURE
	|--------------------------------------------------------------------------
	*/

	if (

		process.env.TEST_FORCE_FAILURE ===
		"true"

	) {

		console.log(
			"[TEST] Simulating bot processing failure"
		);


		throw new Error(
			"TEST_FORCED_FAILURE"
		);

	}


	/*
	|--------------------------------------------------------------------------
	| 1. Find matching rule
	|--------------------------------------------------------------------------
	*/

	const rule =
		await findMatchingRule(
			message
		);


	/*
	|--------------------------------------------------------------------------
	| 2. Determine response
	|--------------------------------------------------------------------------
	*/

	let responseText;


	if (rule) {

		console.log(
			`[Bot] Rule: ${rule.name}`
		);


		responseText =
			rule.response_text;


	} else {

		console.log(
			"[Bot] Rule: DEFAULT"
		);


		responseText =
			getDefaultResponse();

	}


	/*
	|--------------------------------------------------------------------------
	| 3. Validate response
	|--------------------------------------------------------------------------
	*/

	if (!responseText) {

		throw new Error(

			`BOT_RESPONSE_EMPTY:${
				rule?.name ||
				"DEFAULT"
			}`

		);

	}


	/*
	|--------------------------------------------------------------------------
	| 4. Send through WAHA
	|--------------------------------------------------------------------------
	*/

	console.log(
		"[Bot] Sending response to WAHA..."
	);


	const wahaResponse =
		await sendText(

			chatId,

			responseText,

			session

		);


	/*
	|--------------------------------------------------------------------------
	| 5. Extract outbound message ID
	|--------------------------------------------------------------------------
	*/

	const outboundMessageId =
		extractWahaMessageId(
			wahaResponse
		);


	console.log(
		"[Bot] Outbound Message ID:",
		outboundMessageId ||
		"NOT_AVAILABLE"
	);


	/*
	|--------------------------------------------------------------------------
	| 6. Persist outbound message
	|--------------------------------------------------------------------------
	*/

	const outbound =
		await createOutboundMessage({

			messageId:
				outboundMessageId,

			chatId,

			message:
				responseText,

			session,

			receivedAt:
				new Date()

		});


	console.log(
		"[Bot] Outbound message persisted:",
		outbound.record?.id
	);


	/*
	|--------------------------------------------------------------------------
	| 7. Return result to worker
	|--------------------------------------------------------------------------
	*/

	return {

		success:
			true,

		messageId,

		chatId,

		rule:
			rule?.name ||
			null,

		rule_id:
			rule?.id ||
			null,

		responseText,

		outboundMessageId,

		outboundRecordId:
			outbound.record?.id ||
			null,

		waha:
			wahaResponse

	};

}
