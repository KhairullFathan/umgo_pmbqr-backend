import "dotenv/config";

import fs from "fs";
import path from "path";
import {
	fileURLToPath
} from "url";

import {
	QueryTypes
} from "sequelize";

import {
	sequelize
} from "../config/database.js";

const __filename =
	fileURLToPath(import.meta.url);

const __dirname =
	path.dirname(__filename);

const migrationsPath =
	path.join(
		__dirname,
		"migrations"
	);

async function ensureMigrationsTable() {

	await sequelize.query(`
		CREATE TABLE IF NOT EXISTS migrations (
			id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
			name VARCHAR(255) NOT NULL UNIQUE,
			executed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
		)
	`);
}

async function getExecutedMigrations() {

	return await sequelize.query(
		`
		SELECT name
		FROM migrations
		ORDER BY id ASC
		`,
		{
			type: QueryTypes.SELECT
		}
	);
}

async function run() {

	try {

		await sequelize.authenticate();

		console.log(
			"Database connection: SUCCESS"
		);

		await ensureMigrationsTable();

		const executed =
			await getExecutedMigrations();

		const executedNames =
			new Set(
				executed.map(
					migration =>
						migration.name
				)
			);

		const files =
			fs.readdirSync(
				migrationsPath
			)
			.filter(
				file =>
					file.endsWith(".js")
			)
			.sort();

		for (const file of files) {

			if (
				executedNames.has(file)
			) {

				console.log(
					`[Migration] SKIP ${file}`
				);

				continue;
			}

			console.log(
				`[Migration] RUN ${file}`
			);

			const migration =
				await import(
					path.join(
						migrationsPath,
						file
					)
				);

			const transaction =
				await sequelize.transaction();

			try {

				await migration.up(
					sequelize.getQueryInterface(),
					transaction
				);

				await sequelize.query(
					`
					INSERT INTO migrations
					(name)
					VALUES (:name)
					`,
					{
						replacements: {
							name: file
						},
						transaction
					}
				);

				await transaction.commit();

				console.log(
					`[Migration] SUCCESS ${file}`
				);

			} catch (error) {

				await transaction.rollback();

				throw error;
			}
		}

		console.log(
			"All migrations completed."
		);

	} catch (error) {

		console.error(
			"Migration failed:"
		);

		console.error(
			error
		);

		process.exitCode = 1;

	} finally {

		await sequelize.close();
	}
}

run();