import {
	DataTypes
} from "sequelize";

export async function up(queryInterface) {

	await queryInterface.createTable(
		"bot_logs",
		{
			id: {
				type: DataTypes.BIGINT.UNSIGNED,
				autoIncrement: true,
				primaryKey: true
			},

			message_id: {
				type: DataTypes.STRING(255),
				allowNull: true
			},

			job_id: {
				type: DataTypes.STRING(100),
				allowNull: true
			},

			event: {
				type: DataTypes.STRING(100),
				allowNull: false
			},

			data: {
				type: DataTypes.JSON,
				allowNull: true
			},

			created_at: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue:
					DataTypes.NOW
			}
		}
	);

	await queryInterface.addIndex(
		"bot_logs",
		["message_id"]
	);

	await queryInterface.addIndex(
		"bot_logs",
		["job_id"]
	);

	await queryInterface.addIndex(
		"bot_logs",
		["event"]
	);
}

export async function down(queryInterface) {

	await queryInterface.dropTable(
		"bot_logs"
	);
}