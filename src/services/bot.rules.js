export const botRules = [
	{
		name: "Help",
		priority: 1000,
		keywords: [
			"help",
			"bantuan",
			"menu",
			"?"
		],
		response:
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
		priority: 100,
		keywords: ["halo", "hai", "hello", "hi"],
		response:
			"Halo 👋\nAda yang bisa saya bantu?"
	},

	{
		name: "Informasi PMB",
		priority: 90,
		keywords: [
			"pmb",
			"info pmb",
			"informasi pmb",
			"penerimaan mahasiswa baru"
		],
		response:
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
		priority: 80,
		keywords: [
			"1",
			"jalur pendaftaran",
			"jalur"
		],
		response:
			"📋 JALUR PENDAFTARAN\n\n" +
			"Informasi jalur pendaftaran mahasiswa baru dapat dilihat melalui portal PMB UMGO."
	},

	{
		name: "Syarat Pendaftaran",
		priority: 80,
		keywords: [
			"2",
			"syarat pendaftaran",
			"syarat"
		],
		response:
			"📝 SYARAT PENDAFTARAN\n\n" +
			"Silakan menyiapkan dokumen persyaratan sesuai jalur pendaftaran yang dipilih."
	},

	{
		name: "Biaya Kuliah",
		priority: 80,
		keywords: [
			"3",
			"biaya kuliah",
			"biaya"
		],
		response:
			"💰 BIAYA KULIAH\n\n" +
			"Informasi biaya kuliah menyesuaikan program studi dan ketentuan PMB yang berlaku."
	},

	{
		name: "Program Studi",
		priority: 80,
		keywords: [
			"4",
			"program studi",
			"prodi"
		],
		response:
			"🎓 PROGRAM STUDI\n\n" +
			"Silakan pilih program studi yang ingin Anda ketahui informasinya."
	}
];