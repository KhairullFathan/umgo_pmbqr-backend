import {
	DataTypes
} from "sequelize";

export async function up(
	queryInterface,
	transaction
) {

	await queryInterface.createTable(
		"bot_rules",
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

	await queryInterface.addIndex(
		"bot_rules",
		["priority"],
		{
			transaction
		}
	);

	await queryInterface.addIndex(
		"bot_rules",
		["is_active"],
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
		"bot_rules",
		{
			transaction
		}
	);
}