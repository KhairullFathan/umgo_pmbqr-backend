import {
	DataTypes,
	Model
} from "sequelize";

export class BotJob extends Model {}

export function initBotJob(sequelize) {

	BotJob.init(
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
			}
		},
		{
			sequelize,
			modelName: "BotJob",
			tableName: "bot_jobs",

			timestamps: true,
			createdAt: "created_at",
			updatedAt: "updated_at"
		}
	);

	return BotJob;
}