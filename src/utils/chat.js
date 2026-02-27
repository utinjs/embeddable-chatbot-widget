import { botPersonality } from './bot-personality';
import { TTL } from './constants';
import { defaultCors } from './default-cors';
import FAQ from './faq';
import { jsonResponse } from './json-response';
import { chatBotSessionCookie } from './session-cookie';

export default async function chat(request, env) {
	if (request.method !== 'POST') {
		return new Response('Method not allowed', {
			status: 405,
		});
	}

	// is message equivalent to the content of the request body?
	const { message } = await request.json();

	if (!message.trim()) {
		return jsonResponse({ error: 'Message required' }, 400);
	}

	// session management step
	let sessionId = chatBotSessionCookie(request); //getting chatbot_session from cookie comma-separated string
	let isNew = !sessionId; //isNew signals a new session id should be created as it's non-existent at the moment. Useful for first-time scenarios
	let session = sessionId ? await env.CHAT_SESSIONS.get(sessionId, 'json') : null; //at this point, the pulled out sessionId is then used to retrieve {[sessionId]:value}

	// do something else when session is null
	if (!session) {
		sessionId = 'sess_' + crypto.randomUUID(); //generates a new session id and update session from null to something meaningful
		session = {
			id: sessionId,
			messages: [],
			createdAt: Date.now(),
			updatedAt: Date.now(),
		};
		isNew = true;
	}

	session.messages.push({
		role: 'user',
		content: message.trim(),
		timestamp: Date.now(),
	});

	// context provision and stream management?
	const context = await FAQ(env, message);
	//
	const messages = [
		// system message
		{
			role: 'system',
			content: botPersonality + (context ? `\n\nFAQ:\n${context}` : ''),

			/*
			System content is something like::

			`
			You are a helpful customer support assistant. Be friendly, professional, and concise. Use the FAQ context to give accurate answers. If you don't know something, say so.

			FAQ:
			Question:Possible question 1
			Answer:Possible answer 1


			Question:Possible question 2
			Answer:Possible answer 2

			
			Question:Possible question 3
			Answer:Possible anwer 3
			`
			*/
		},

		// user message
		...session.messages.slice(-10).map((message) => ({
			role: message.role,
			content: message.content,
		})),
	];

	const stream = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
		messages,
		stream: true,
	});

	// assembling the messgae? or something else??
	let full = '';

	// using TransformStream method is being used to modify/transform the response body
	const { readable, writable } = new TransformStream({
		transform(chunk, controller) {
			for (const line of new TextDecoder().decode(chunk).split('\n')) {
				if (line.startsWith('data: ') && line.slice(6) !== '[DONE]') {
					try {
						full += JSON.parse(line.slice(6)).response || '';
					} catch (error) {}
				}
			}

			controller.enqueue(chunk);
		},

		async flush() {
			if (full) {
				session.messages.push({
					role: 'assistant',
					content: full,
					timestamp: Date.now(),
				});

				session.updatedAt = Date.now();

				await env.CHAT_SESSIONS.put(sessionId, JSON.stringify(session), {
					expirationTTL: TTL,
				});
			}
		},
	});

	stream.pipeTo(writable);

	return new Response(readable, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			...defaultCors,
			...(isNew
				? {
						'Set-Cookie': `chatbot_session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${TTL}`,
					}
				: {}),
		},
	});
}
