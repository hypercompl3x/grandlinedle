import http from 'node:http';

export async function startMockServer(port = 54321) {
	const server = http.createServer(async (req, res) => {
		const url = req.url || '';
		res.setHeader('content-type', 'application/json');

		// Fake auth token endpoint
		if (req.method === 'POST' && url.startsWith('/auth/v1/token')) {
			res.statusCode = 200;
			res.end(
				JSON.stringify({
					access_token: 'fake-access-token',
					token_type: 'bearer',
					expires_in: 3600,
					refresh_token: 'fake-refresh-token',
					user: { id: 'user_123', email: 'test@example.com' },
				}),
			);
			return;
		}

		// Fake data endpoint
		if (req.method === 'GET' && url.startsWith('/rest/v1/todos')) {
			res.statusCode = 200;
			res.end(JSON.stringify([{ id: 1, title: 'mock todo', done: false }]));
			return;
		}

		res.statusCode = 404;
		res.end(JSON.stringify({ error: 'not found', url }));
	});

	await new Promise<void>(resolve => server.listen(port, resolve));

	return {
		baseUrl: `http://127.0.0.1:${port}`,
		close: () => new Promise<void>(resolve => server.close(() => resolve())),
	};
}
