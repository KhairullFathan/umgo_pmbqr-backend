import {
	redisConnection
} from "../config/redis.js";


/*
|--------------------------------------------------------------------------
| Normalize Chat ID
|--------------------------------------------------------------------------
*/

function normalizeChatId(chatId) {

	return chatId.replace(
		/[^a-zA-Z0-9]/g,
		"_"
	);

}


/*
|--------------------------------------------------------------------------
| Redis Keys
|--------------------------------------------------------------------------
*/

function sequenceKey(chatId) {

	return (
		`chat:sequence:` +
		normalizeChatId(chatId)
	);

}


function expectedKey(chatId) {

	return (
		`chat:expected:` +
		normalizeChatId(chatId)
	);

}


function lockKey(chatId) {

	return (
		`chat:lock:` +
		normalizeChatId(chatId)
	);

}


/*
|--------------------------------------------------------------------------
| Get Next Sequence
|--------------------------------------------------------------------------
*/

export async function getNextSequence(
	chatId
) {

	return await redisConnection.incr(
		sequenceKey(chatId)
	);

}


/*
|--------------------------------------------------------------------------
| Get Expected Sequence
|--------------------------------------------------------------------------
*/

export async function getExpectedSequence(
	chatId
) {

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
| Claim Sequence
|--------------------------------------------------------------------------
|
| Atomic operation:
|
| 1. Pastikan expected tersedia.
| 2. Pastikan sequence sesuai expected.
| 3. Ambil lock.
|
|--------------------------------------------------------------------------
*/

const claimSequenceScript = `

local expected =
	redis.call(
		"GET",
		KEYS[1]
	)

if not expected then

	expected = "1"

	redis.call(
		"SET",
		KEYS[1],
		expected
	)

end


if tonumber(expected)
	~= tonumber(ARGV[1]) then

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


	const claimed =
		result === 1;


	if (claimed) {

		console.log(
			`[Ordering] Sequence ${sequence} claimed`
		);

	}


	return claimed;

}


/*
|--------------------------------------------------------------------------
| Advance Sequence
|--------------------------------------------------------------------------
|
| expected:
|
| 1 → 2
| 2 → 3
| 3 → 4
|
|--------------------------------------------------------------------------
*/

const advanceSequenceScript = `

local expected =
	redis.call(
		"GET",
		KEYS[1]
	)


if not expected then

	return 0

end


if tonumber(expected)
	~= tonumber(ARGV[1]) then

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


	const advanced =
		result === 1;


	if (advanced) {

		console.log(
			`[Ordering] Sequence ${sequence} advanced`
		);

	}


	return advanced;

}


/*
|--------------------------------------------------------------------------
| Release Lock
|--------------------------------------------------------------------------
|
| Hanya worker pemilik lock yang boleh menghapus lock.
|--------------------------------------------------------------------------
*/

const releaseLockScript = `

local current =
	redis.call(
		"GET",
		KEYS[1]
	)


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


	const released =
		result === 1;


	console.log(
		`[Ordering] Lock released: ${released}`
	);


	return released;

}


/*
|--------------------------------------------------------------------------
| Skip Sequence
|--------------------------------------------------------------------------
|
| Digunakan hanya jika job benar-benar gagal
| setelah seluruh retry BullMQ habis.
|--------------------------------------------------------------------------
*/

const skipSequenceScript = `

local expected =
	redis.call(
		"GET",
		KEYS[1]
	)


if not expected then

	expected = "1"

	redis.call(
		"SET",
		KEYS[1],
		expected
	)

end


if tonumber(expected)
	~= tonumber(ARGV[1]) then

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


	const skipped =
		result === 1;


	if (skipped) {

		console.log(
			`[Ordering] Skipping sequence ${sequence}`
		);

	}


	return skipped;

}
