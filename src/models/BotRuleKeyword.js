import {
	DataTypes,
	Model
} from "sequelize";

export class BotRuleKeyword extends Model {}

export function initBotRuleKeyword(sequelize) {

	BotRuleKeyword.init(
		{
			id: {
				type: DataTypes.BIGINT.UNSIGNED,
				autoIncrement: true,
				primaryKey: true
			},

			rule_id: {
				type: DataTypes.BIGINT.UNSIGNED,
				allowNull: false
			},

			keyword: {
				type: DataTypes.STRING(255),
				allowNull: false
			},

			match_type: {
				type: DataTypes.ENUM(
					"EXACT",
					"CONTAINS",
					"STARTS_WITH"
				),
				allowNull: false,
				defaultValue: "EXACT"
			}
		},
		{
			sequelize,
			modelName: "BotRuleKeyword",
			tableName: "bot_rule_keywords",

			timestamps: true,
			createdAt: "created_at",
			updatedAt: "updated_at"
		}
	);

	return BotRuleKeyword;
}