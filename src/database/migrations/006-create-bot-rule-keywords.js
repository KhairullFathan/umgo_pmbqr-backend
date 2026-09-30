import {
	DataTypes
} from "sequelize";

export async function up(
	queryInterface,
	transaction
) {

	await queryInterface.createTable(
		"bot_rule_keywords",
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
			},

			created_at: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW
			},

			updated_at: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW
			}
		},
		{
			transaction
		}
	);

	await queryInterface.addConstraint(
		"bot_rule_keywords",
		{
			fields: ["rule_id"],
			type: "foreign key",
			name: "fk_bot_rule_keywords_rule_id",

			references: {
				table: "bot_rules",
				field: "id"
			},

			onUpdate: "CASCADE",
			onDelete: "CASCADE",

			transaction
		}
	);

	await queryInterface.addIndex(
		"bot_rule_keywords",
		["keyword"],
		{
			transaction
		}
	);

	await queryInterface.addIndex(
		"bot_rule_keywords",
		["rule_id"],
		{
			transaction
		}
	);
}

export async function down(
	queryInterface,
	transaction
) {

	await queryInterface.dropTable(
		"bot_rule_keywords",
		{
			transaction
		}
	);
}