import {
	BotRule
} from "../models/index.js";


export async function findMatchingRule(
	message
) {

	if (
		!message ||
		typeof message !== "string"
	) {
		return null;
	}


	const text =
		message
			.toLowerCase()
			.trim();


	const rules =
		await BotRule.findAll({

			where: {
				is_active: true
			},

			include: [
				{
					association: "keywords",
					required: true
				}
			],

			order: [
				[
					"priority",
					"DESC"
				]
			]
		});


	for (
		const rule
		of rules
	) {

		for (
			const keyword
			of rule.keywords
		) {

			const value =
				keyword.keyword
					.toLowerCase()
					.trim();


			if (
				keyword.match_type ===
				"EXACT"
			) {

				if (
					text === value
				) {
					return rule;
				}
			}


			if (
				keyword.match_type ===
				"CONTAINS"
			) {

				if (
					text.includes(value)
				) {
					return rule;
				}
			}


			if (
				keyword.match_type ===
				"STARTS_WITH"
			) {

				if (
					text.startsWith(value)
				) {
					return rule;
				}
			}
		}
	}


	return null;
}


export function getDefaultResponse() {

	return (
		"🤖 Maaf, saya belum memahami " +
		"perintah tersebut.\n\n" +

		"Untuk melihat cara penggunaan bot, " +
		"silakan ketik:\n\n" +

		"*help*\n\n" +

		"Contoh:\n" +

		"• help\n" +
		"• info pmb\n" +
		"• jalur pendaftaran"
	);
}