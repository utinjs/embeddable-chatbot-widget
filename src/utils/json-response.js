export const jsonResponse = (data, status = 200, header = {}) =>
	new Response(JSON.stringify(data), {
		status,
		headers: {
			'Content-Type': 'application/json',
			...cors,
			...header,
		},
	});
