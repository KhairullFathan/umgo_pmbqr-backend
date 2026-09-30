import "dotenv/config";

import {
    sequelize,
    BotContact,
    BotMessage,
    BotJob,
    BotLog,
    BotRule,
    BotRuleKeyword
} from "../models/index.js";

try {

    await sequelize.authenticate();

    console.log("====================================");
    console.log("DATABASE CONNECTION");
    console.log("====================================");

    console.log("Database connection: SUCCESS");

    console.log("");
    console.log("Models:");

    console.log(
        "BotContact      :",
        BotContact.tableName
    );

    console.log(
        "BotMessage      :",
        BotMessage.tableName
    );

    console.log(
        "BotJob          :",
        BotJob.tableName
    );

    console.log(
        "BotLog          :",
        BotLog.tableName
    );

    console.log(
        "BotRule         :",
        BotRule.tableName
    );

    console.log(
        "BotRuleKeyword  :",
        BotRuleKeyword.tableName
    );

    console.log("====================================");

    await sequelize.close();

    process.exit(0);

} catch (error) {

    console.error(
        "Model test FAILED:"
    );

    console.error(error);

    process.exit(1);
}