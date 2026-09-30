import "dotenv/config";

import {
	sequelize
} from "../models/index.js";

import {
	findMatchingRule
} from "../services/rule.service.js";


const tests = [
	"help",
	"halo",
	"hai",
	"pmb",
	"info pmb",
	"jalur pendaftaran",
	"syarat",
	"biaya",
	"prodi",
	"pesan yang tidak dikenal"
];


try {

	await sequelize.authenticate();

	console.log(
		"===================================="
	);

	console.log(
		"RULE ENGINE TEST"
	);

	console.log(
		"===================================="
	);


	for (
		const message
		of tests
	) {

		const rule =
			await findMatchingRule(
				message
			);


		console.log("");

		console.log(
			"Message :",
			message
		);

		console.log(
			"Rule    :",
			rule?.name || "DEFAULT"
		);
	}


	console.log("");
	console.log(
		"RULE ENGINE TEST COMPLETED"
	);

	console.log(
		"===================================="
	);


	await sequelize.close();

} catch (error) {

	console.error(
		"RULE ENGINE TEST FAILED"
	);

	console.error(error);

	process.exit(1);
}