import {
	DataTypes
} from "sequelize";

export async function up(queryInterface) {

	await queryInterface.createTable(
		"bot_messages",
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
				defaultValue:
					DataTypes.NOW
			},

			processed_at: {
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
		"bot_messages",
		["chat_id", "sequence"]
	);

	await queryInterface.addIndex(
		"bot_messages",
		["chat_id", "created_at"]
	);
}

export async function down(queryInterface) {

	await queryInterface.dropTable(
		"bot_messages"
	);
}