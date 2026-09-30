import "dotenv/config";

import {
	sequelize,
	BotRule,
	BotRuleKeyword
} from "../models/index.js";


const rules = [
	{
		name: "Help",

		description:
			"Menampilkan daftar bantuan bot.",

		priority: 1000,

		keywords: [
			"help",
			"bantuan",
			"menu",
			"?"
		],

		response_type: "TEXT",

		response_text:
			"🤖 BANTUAN BOT\n\n" +
			"Berikut beberapa perintah yang dapat digunakan:\n\n" +
			"👋 *halo*\n" +
			"Menyapa bot.\n\n" +
			"📚 *info pmb*\n" +
			"Menampilkan informasi Penerimaan Mahasiswa Baru.\n\n" +
			"📋 *jalur pendaftaran*\n" +
			"Informasi jalur pendaftaran.\n\n" +
			"📝 *syarat pendaftaran*\n" +
			"Informasi persyaratan pendaftaran.\n\n" +
			"💰 *biaya kuliah*\n" +
			"Informasi biaya kuliah.\n\n" +
			"🎓 *program studi*\n" +
			"Informasi program studi.\n\n" +
			"❓ *help*\n" +
			"Menampilkan bantuan ini.\n\n" +
			"Jika pesan Anda tidak dikenali, silakan ketik *help* untuk melihat daftar perintah."
	},

	{
		name: "Salam",

		description:
			"Menangani sapaan pengguna.",

		priority: 100,

		keywords: [
			"halo",
			"hai",
			"hello",
			"hi"
		],

		response_type: "TEXT",

		response_text:
			"Halo 👋\nAda yang bisa saya bantu?"
	},

	{
		name: "Informasi PMB",

		description:
			"Menampilkan informasi umum Penerimaan Mahasiswa Baru.",

		priority: 90,

		keywords: [
			"pmb",
			"info pmb",
			"informasi pmb",
			"penerimaan mahasiswa baru"
		],

		response_type: "TEXT",

		response_text:
			"📚 INFORMASI PMB UMGO\n\n" +
			"Penerimaan Mahasiswa Baru Universitas Muhammadiyah Gorontalo.\n\n" +
			"Silakan pilih informasi:\n\n" +
			"1. Jalur Pendaftaran\n" +
			"2. Syarat Pendaftaran\n" +
			"3. Biaya Kuliah\n" +
			"4. Program Studi\n\n" +
			"Ketik angka 1-4."
	},

	{
		name: "Jalur Pendaftaran",

		description:
			"Informasi jalur pendaftaran mahasiswa baru.",

		priority: 80,

		keywords: [
			"1",
			"jalur pendaftaran",
			"jalur"
		],

		response_type: "TEXT",

		response_text:
			"📋 JALUR PENDAFTARAN\n\n" +
			"Informasi jalur pendaftaran mahasiswa baru dapat dilihat melalui portal PMB UMGO."
	},

	{
		name: "Syarat Pendaftaran",

		description:
			"Informasi persyaratan pendaftaran mahasiswa baru.",

		priority: 80,

		keywords: [
			"2",
			"syarat pendaftaran",
			"syarat"
		],

		response_type: "TEXT",

		response_text:
			"📝 SYARAT PENDAFTARAN\n\n" +
			"Silakan menyiapkan dokumen persyaratan sesuai jalur pendaftaran yang dipilih."
	},

	{
		name: "Biaya Kuliah",

		description:
			"Informasi biaya kuliah mahasiswa baru.",

		priority: 80,

		keywords: [
			"3",
			"biaya kuliah",
			"biaya"
		],

		response_type: "TEXT",

		response_text:
			"💰 BIAYA KULIAH\n\n" +
			"Informasi biaya kuliah menyesuaikan program studi dan ketentuan PMB yang berlaku."
	},

	{
		name: "Program Studi",

		description:
			"Informasi program studi yang tersedia.",

		priority: 80,

		keywords: [
			"4",
			"program studi",
			"prodi"
		],

		response_type: "TEXT",

		response_text:
			"🎓 PROGRAM STUDI\n\n" +
			"Silakan pilih program studi yang ingin Anda ketahui informasinya."
	}
];


async function seed() {

	const transaction =
		await sequelize.transaction();

	try {

		for (const data of rules) {

			const [rule, created] =
				await BotRule.findOrCreate(
					{
						where: {
							name: data.name
						},

						defaults: {
							name: data.name,
							description:
								data.description,
							response_type:
								data.response_type,
							response_text:
								data.response_text,
							priority:
								data.priority,
							is_active: true
						},

						transaction
					}
				);


			/*
			|--------------------------------------------------------------------------
			| Update existing rule
			|--------------------------------------------------------------------------
			*/

			if (!created) {

				await rule.update(
					{
						description:
							data.description,

						response_type:
							data.response_type,

						response_text:
							data.response_text,

						priority:
							data.priority
					},
					{
						transaction
					}
				);
			}


			/*
			|--------------------------------------------------------------------------
			| Keywords
			|--------------------------------------------------------------------------
			*/

			for (
				const keyword
				of data.keywords
			) {

				await BotRuleKeyword.findOrCreate(
					{
						where: {
							rule_id: rule.id,
							keyword
						},

						defaults: {
							rule_id: rule.id,
							keyword,
							match_type: "EXACT"
						},

						transaction
					}
				);
			}

			console.log(
				`[Seed] ${data.name}`
			);
		}

		await transaction.commit();

		console.log(
			"===================================="
		);

		console.log(
			"BOT RULE SEED COMPLETED"
		);

		console.log(
			"===================================="
		);

	} catch (error) {

		await transaction.rollback();

		console.error(
			"BOT RULE SEED FAILED"
		);

		console.error(error);

		process.exitCode = 1;

	} finally {

		await sequelize.close();
	}
}


seed();