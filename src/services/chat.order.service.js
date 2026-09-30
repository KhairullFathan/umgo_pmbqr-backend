import { redisConnection } from "../config/redis.js";

function normalizeChatId(chatId) {
	return chatId.replace(
		/[^a-zA-Z0-9]/g,
		"_"
	);
}

function sequenceKey(chatId) {
	return `chat:sequence:${normalizeChatId(chatId)}`;
}

function expectedKey(chatId) {
	return `chat:expected:${normalizeChatId(chatId)}`;
}

function lockKey(chatId) {
	return `chat:lock:${normalizeChatId(chatId)}`;
}

/*
|--------------------------------------------------------------------------
| SEQUENCE
|--------------------------------------------------------------------------
*/

export async function getNextSequence(chatId) {
	return await redisConnection.incr(
		sequenceKey(chatId)
	);
}

/*
|--------------------------------------------------------------------------
| EXPECTED SEQUENCE
|--------------------------------------------------------------------------
*/

export async function getExpectedSequence(chatId) {
	const value =
		await redisConnection.get(
			expectedKey(chatId)
		);

	if (!value) {
		return 1;
	}

	return Number(value);
}

/*
|--------------------------------------------------------------------------
| CLAIM SEQUENCE
|--------------------------------------------------------------------------
|
| Sequence hanya boleh diproses jika:
|
| expected == sequence
|
| dan lock chat belum digunakan.
|
*/

const claimSequenceScript = `
local expected =
	redis.call("GET", KEYS[1])

if not expected then
	expected = "1"
end

if tonumber(expected) ~= tonumber(ARGV[1]) then
	return 0
end

local result =
	redis.call(
		"SET",
		KEYS[2],
		ARGV[2],
		"NX",
		"EX",
		ARGV[3]
	)

if result then
	return 1
end

return 0
`;

export async function claimSequence(
	chatId,
	sequence,
	workerId,
	lockTtl = 300
) {
	const result =
		await redisConnection.eval(
			claimSequenceScript,
			2,
			expectedKey(chatId),
			lockKey(chatId),
			sequence,
			workerId,
			lockTtl
		);

	return result === 1;
}

/*
|--------------------------------------------------------------------------
| ADVANCE SEQUENCE
|--------------------------------------------------------------------------
*/

const advanceSequenceScript = `
local expected =
	redis.call("GET", KEYS[1])

if not expected then
	return 0
end

if tonumber(expected) ~= tonumber(ARGV[1]) then
	return 0
end

redis.call(
	"SET",
	KEYS[1],
	tonumber(ARGV[1]) + 1
)

return 1
`;

export async function advanceSequence(
	chatId,
	sequence
) {
	const result =
		await redisConnection.eval(
			advanceSequenceScript,
			1,
			expectedKey(chatId),
			sequence
		);

	return result === 1;
}

/*
|--------------------------------------------------------------------------
| RELEASE LOCK
|--------------------------------------------------------------------------
*/

const releaseLockScript = `
local current =
	redis.call("GET", KEYS[1])

if current == ARGV[1] then
	return redis.call(
		"DEL",
		KEYS[1]
	)
end

return 0
`;

export async function releaseChatLock(
	chatId,
	workerId
) {
	const result =
		await redisConnection.eval(
			releaseLockScript,
			1,
			lockKey(chatId),
			workerId
		);

	return result === 1;
}

/*
|--------------------------------------------------------------------------
| SKIP FAILED SEQUENCE
|--------------------------------------------------------------------------
|
| Hanya digunakan jika:
| - processing benar-benar gagal
| - retry sudah habis
|
| JANGAN digunakan untuk MESSAGE_ORDER_WAIT.
|
*/

const skipSequenceScript = `
local expected =
	redis.call("GET", KEYS[1])

if not expected then
	expected = "1"
end

if tonumber(expected) ~= tonumber(ARGV[1]) then
	return 0
end

redis.call(
	"SET",
	KEYS[1],
	tonumber(ARGV[1]) + 1
)

return 1
`;

export async function skipSequence(
	chatId,
	sequence
) {
	const result =
		await redisConnection.eval(
			skipSequenceScript,
			1,
			expectedKey(chatId),
			sequence
		);

	return result === 1;
}