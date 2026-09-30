import { Queue } from "bullmq";

import {
	redisConnection
} from "../config/redis.js";

export const botQueue =
	new Queue(
		"whatsapp-messages",
		{
			connection:
				redisConnection,

			defaultJobOptions: {
				attempts: 10,

				backoff: {
					type: "fixed",
					delay: 1000
				},

				removeOnComplete: 1000,
				removeOnFail: 5000
			}
		}
	);