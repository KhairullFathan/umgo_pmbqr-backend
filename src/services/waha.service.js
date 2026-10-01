import axios from "axios";

const waha = axios.create({
	baseURL: process.env.WAHA_URL,
	headers: {
		"Content-Type": "application/json",
		"X-Api-Key": process.env.WAHA_API_KEY
	},
	timeout: Number(
		process.env.WAHA_TIMEOUT || 30000
	)
});


/*
|--------------------------------------------------------------------------
| Send Text
|--------------------------------------------------------------------------
*/

export async function sendText(
	chatId,
	text,
	session = process.env.WAHA_SESSION
) {

	if (!chatId) {
		throw new Error(
			"WAHA_CHAT_ID_REQUIRED"
		);
	}

	if (!text) {
		throw new Error(
			"WAHA_MESSAGE_REQUIRED"
		);
	}

	if (!session) {
		throw new Error(
			"WAHA_SESSION_REQUIRED"
		);
	}


	try {

		const response =
			await waha.post(
				"/api/sendText",
				{
					chatId,
					text,
					session
				}
			);


		console.log(
			"[WAHA] Message sent"
		);

		console.log(
			"Chat    :",
			chatId
		);

		console.log(
			"Session :",
			session
		);


		return response.data;

	} catch (error) {

		/*
		|--------------------------------------------------------------------------
		| Normalisasi error
		|--------------------------------------------------------------------------
		*/

		const status =
			error.response?.status;

		const responseData =
			error.response?.data;


		console.error(
			"[WAHA] Failed to send message"
		);

		console.error(
			"Status :",
			status || "NO_RESPONSE"
		);

		console.error(
			"Response:",
			responseData || error.message
		);


		const normalizedError =
			new Error(
				`WAHA_SEND_FAILED:${status || "NETWORK"}`
			);


		normalizedError.status =
			status || null;

		normalizedError.response =
			responseData || null;

		normalizedError.originalError =
			error;


		throw normalizedError;
	}
}