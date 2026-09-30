import "dotenv/config";

import {
	Sequelize
} from "sequelize";

export const sequelize =
	new Sequelize(
		process.env.DB_DATABASE,
		process.env.DB_USERNAME,
		process.env.DB_PASSWORD,
		{
			host:
				process.env.DB_HOST,

			port:
				Number(
					process.env.DB_PORT || 3306
				),

			dialect: "mysql",

			logging: false,

			timezone: "+08:00",

			pool: {
				max: 10,
				min: 0,
				acquire: 30000,
				idle: 10000
			}
		}
	);