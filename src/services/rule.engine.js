import { botRules } from "./bot.rules.js";

export function findMatchingRule(message) {
	const text = message
		.toLowerCase()
		.trim();

	const sortedRules = [...botRules].sort(
		(a, b) => b.priority - a.priority
	);

	for (const rule of sortedRules) {
		for (const keyword of rule.keywords) {
			if (text === keyword.toLowerCase()) {
				return rule;
			}
		}
	}

	return null;
}

export function getDefaultResponse() {
	return (
		"🤖 Maaf, saya belum memahami perintah tersebut.\n\n" +
		"Untuk melihat cara penggunaan bot, silakan ketik:\n\n" +
		"*help*\n\n" +
		"Contoh:\n" +
		"• help\n" +
		"• info pmb\n" +
		"• jalur pendaftaran"
	);
}