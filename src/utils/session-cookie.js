export const chatBotSessionCookie = (payload) => payload.headers.get('Cookie')?.match(/chatbot_session=([^;]+)/)?.[1];
