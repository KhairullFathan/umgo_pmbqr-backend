import {
	DataTypes
} from "sequelize";

export async function up(queryInterface) {

	await queryInterface.createTable(
		"bot_jobs",
		{
			id: {
				type: DataTypes.BIGINT.UNSIGNED,
				autoIncrement: true,
				primaryKey: true
			},

			job_id: {
				type: DataTypes.STRING(100),
				allowNull: false,
				unique: true
			},

			message_id: {
				type: DataTypes.STRING(255),
				allowNull: false
			},

			status: {
				type: DataTypes.ENUM(
					"QUEUED",
					"PROCESSING",
					"COMPLETED",
					"FAILED"
				),
				allowNull: false,
				defaultValue: "QUEUED"
			},

			attempts: {
				type: DataTypes.INTEGER.UNSIGNED,
				allowNull: false,
				defaultValue: 0
			},

			error_message: {
				type: DataTypes.TEXT,
				allowNull: true
			},

			started_at: {
				type: DataTypes.DATE,
				allowNull: true
			},

			completed_at: {
				type: DataTypes.DATE,
				allowNull: true
			},

			created_at: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue:
					DataTypes.NOW
			},

			updated_at: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue:
					DataTypes.NOW
			}
		}
	);

	await queryInterface.addIndex(
		"bot_jobs",
		["message_id"]
	);
}

export async function down(queryInterface) {

	await queryInterface.dropTable(
		"bot_jobs"
	);
}