import {
	sendText
} from "./waha.service.js";

import {
	findMatchingRule,
	getDefaultResponse
} from "./rule.service.js";


export async function processBotMessage({
	chatId,
	message,
	session
}) {

	console.log(
		`[Bot] Processing ${chatId}: ${message}`
	);


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


	const rule =
		await findMatchingRule(
			message
		);


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


	await sendText(
		chatId,
		responseText,
		session
	);


	return {
		success: true,

		rule:
			rule?.name || null,

		rule_id:
			rule?.id || null
	};
}