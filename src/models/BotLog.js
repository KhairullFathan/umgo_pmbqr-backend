import {
	DataTypes,
	Model
} from "sequelize";

export class BotLog extends Model {}

export function initBotLog(sequelize) {

	BotLog.init(
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
			}
		},
		{
			sequelize,
			modelName: "BotLog",
			tableName: "bot_logs",

			timestamps: true,
			createdAt: "created_at",
			updatedAt: false
		}
	);

	return BotLog;
}