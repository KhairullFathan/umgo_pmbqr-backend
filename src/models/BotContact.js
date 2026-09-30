import {
	DataTypes,
	Model
} from "sequelize";

export class BotContact extends Model {}

export function initBotContact(sequelize) {

	BotContact.init(
		{
			id: {
				type: DataTypes.BIGINT.UNSIGNED,
				autoIncrement: true,
				primaryKey: true
			},

			chat_id: {
				type: DataTypes.STRING(100),
				allowNull: false,
				unique: true
			},

			name: {
				type: DataTypes.STRING(255),
				allowNull: true
			},

			push_name: {
				type: DataTypes.STRING(255),
				allowNull: true
			},

			phone_number: {
				type: DataTypes.STRING(30),
				allowNull: true
			},

			last_message_at: {
				type: DataTypes.DATE,
				allowNull: true
			}
		},
		{
			sequelize,
			modelName: "BotContact",
			tableName: "bot_contacts",

			timestamps: true,
			createdAt: "created_at",
			updatedAt: "updated_at"
		}
	);

	return BotContact;
}