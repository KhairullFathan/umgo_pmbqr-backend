import {
	DataTypes,
	Model
} from "sequelize";

export class BotRule extends Model {}

export function initBotRule(sequelize) {

	BotRule.init(
		{
			id: {
				type: DataTypes.BIGINT.UNSIGNED,
				autoIncrement: true,
				primaryKey: true
			},

			name: {
				type: DataTypes.STRING(150),
				allowNull: false
			},

			description: {
				type: DataTypes.TEXT,
				allowNull: true
			},

			response_type: {
				type: DataTypes.ENUM(
					"TEXT",
					"IMAGE",
					"DOCUMENT",
					"BUTTON",
					"LIST"
				),
				allowNull: false,
				defaultValue: "TEXT"
			},

			response_text: {
				type: DataTypes.TEXT,
				allowNull: true
			},

			priority: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 0
			},

			is_active: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: true
			}
		},
		{
			sequelize,
			modelName: "BotRule",
			tableName: "bot_rules",

			timestamps: true,
			createdAt: "created_at",
			updatedAt: "updated_at"
		}
	);

	return BotRule;
}