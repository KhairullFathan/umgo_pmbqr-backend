import {
	DataTypes,
	Model
} from "sequelize";

export class BotMessage extends Model {}

export function initBotMessage(sequelize) {

	BotMessage.init(
		{
			id: {
				type: DataTypes.BIGINT.UNSIGNED,
				autoIncrement: true,
				primaryKey: true
			},

			message_id: {
				type: DataTypes.STRING(255),
				allowNull: false,
				unique: true
			},

			chat_id: {
				type: DataTypes.STRING(100),
				allowNull: false
			},

			sequence: {
				type: DataTypes.BIGINT.UNSIGNED,
				allowNull: false
			},

			direction: {
				type: DataTypes.ENUM(
					"INBOUND",
					"OUTBOUND"
				),
				allowNull: false
			},

			message: {
				type: DataTypes.TEXT,
				allowNull: true
			},

			status: {
				type: DataTypes.ENUM(
					"RECEIVED",
					"QUEUED",
					"PROCESSING",
					"SENT",
					"FAILED"
				),
				allowNull: false,
				defaultValue: "RECEIVED"
			},

			session: {
				type: DataTypes.STRING(100),
				allowNull: true
			},

			received_at: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW
			},

			processed_at: {
				type: DataTypes.DATE,
				allowNull: true
			}
		},
		{
			sequelize,
			modelName: "BotMessage",
			tableName: "bot_messages",

			timestamps: true,
			createdAt: "created_at",
			updatedAt: "updated_at"
		}
	);

	return BotMessage;
}