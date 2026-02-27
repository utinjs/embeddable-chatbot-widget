import chat from './utils/chat';
import { defaultCors } from './utils/default-cors';
import { jsonResponse } from './utils/json-response';
import seed from './utils/seed';
import { chatBotSessionCookie } from './utils/session-cookie';

export default {
	async fetch(request, env) {
		// request -> Method, URL, Headers, Body
		const requestPath = new URL(request.url).pathname;

		if (request.method === 'OPTIONS')
			return new Response(null, {
				headers: { ...defaultCors, 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' },
			});

		if (requestPath === '/api/chat') return chat(request, env);

		if (requestPath === '/api/seed') return seed(request, env);

		if (requestPath === '/api/history') {
			const session = chatBotSessionCookie(request);

			return jsonResponse({
				messages: session ? (await env.CHAT_SESSIONS.get(session, 'json'))?.messages || [] : [],
			});
		}

		if (requestPath === '/api/health')
			return jsonResponse({
				status: 'ok',
			});

		return env.ASSETS.fetch(request);
	},
};
