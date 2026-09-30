import {
	DataTypes
} from "sequelize";

export async function up(queryInterface) {

	await queryInterface.createTable(
		"bot_contacts",
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
}

export async function down(queryInterface) {

	await queryInterface.dropTable(
		"bot_contacts"
	);
}