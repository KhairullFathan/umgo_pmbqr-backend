import axios from "axios"

const waha = axios.create({
  baseURL: process.env.WAHA_URL,
  headers: {
    "Content-Type": "application/json",
    "X-Api-Key": process.env.WAHA_API_KEY
  }
});

export async function getSessions() {
  const response = await waha.get("/api/sessions");

  return response.data;
}

export async function getSession(session = process.env.WAHA_SESSION) {
  const response = await waha.get(`/api/sessions/${session}`);

  return response.data;
}

export async function sendText(chatId, text, session = process.env.WAHA_SESSION) {
  const response = await waha.post("/api/sendText", {
    chatId,
    text,
    session
  });

  return response.data;
}

export default waha;