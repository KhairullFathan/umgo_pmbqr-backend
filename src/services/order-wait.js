export function isOrderWaitError(error) {
	return (
		error?.message?.startsWith(
			"MESSAGE_ORDER_WAIT:"
		) === true
	);
}