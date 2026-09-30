import {
	sequelize
} from "../config/database.js";

import {
	BotContact,
	initBotContact
} from "./BotContact.js";

import {
	BotMessage,
	initBotMessage
} from "./BotMessage.js";

import {
	BotJob,
	initBotJob
} from "./BotJob.js";

import {
	BotLog,
	initBotLog
} from "./BotLog.js";

import {
	BotRule,
	initBotRule
} from "./BotRule.js";

import {
	BotRuleKeyword,
	initBotRuleKeyword
} from "./BotRuleKeyword.js";


/*
|--------------------------------------------------------------------------
| Initialize Models
|--------------------------------------------------------------------------
*/

initBotContact(sequelize);
initBotMessage(sequelize);
initBotJob(sequelize);
initBotLog(sequelize);
initBotRule(sequelize);
initBotRuleKeyword(sequelize);


/*
|--------------------------------------------------------------------------
| Contact → Messages
|--------------------------------------------------------------------------
*/

BotContact.hasMany(
	BotMessage,
	{
		foreignKey: "chat_id",
		sourceKey: "chat_id",
		as: "messages"
	}
);

BotMessage.belongsTo(
	BotContact,
	{
		foreignKey: "chat_id",
		targetKey: "chat_id",
		as: "contact"
	}
);


/*
|--------------------------------------------------------------------------
| Message → Job
|--------------------------------------------------------------------------
*/

BotMessage.hasMany(
	BotJob,
	{
		foreignKey: "message_id",
		sourceKey: "message_id",
		as: "jobs"
	}
);

BotJob.belongsTo(
	BotMessage,
	{
		foreignKey: "message_id",
		targetKey: "message_id",
		as: "messageRecord"
	}
);


/*
|--------------------------------------------------------------------------
| Message → Logs
|--------------------------------------------------------------------------
*/

BotMessage.hasMany(
	BotLog,
	{
		foreignKey: "message_id",
		sourceKey: "message_id",
		as: "logs"
	}
);

BotLog.belongsTo(
	BotMessage,
	{
		foreignKey: "message_id",
		targetKey: "message_id",
		as: "messageRecord"
	}
);


/*
|--------------------------------------------------------------------------
| Rule → Keywords
|--------------------------------------------------------------------------
*/

BotRule.hasMany(
	BotRuleKeyword,
	{
		foreignKey: "rule_id",
		sourceKey: "id",
		as: "keywords",

		onDelete: "CASCADE",
		hooks: true
	}
);

BotRuleKeyword.belongsTo(
	BotRule,
	{
		foreignKey: "rule_id",
		targetKey: "id",
		as: "rule"
	}
);


/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export {
	sequelize,

	BotContact,
	BotMessage,
	BotJob,
	BotLog,

	BotRule,
	BotRuleKeyword
};