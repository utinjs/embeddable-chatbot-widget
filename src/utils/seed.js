import { jsonResponse } from './json-response';

export default async function seed(request, env) {
	if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });

	const FAQsSeedData = [
		['How long does shipping take?', 'Standard 5-7 days, Express 2-3 days, Same-day in select areas.'],
		['What is your return policy?', '30-day returns for unused items. Electronics 15 days if defective.'],
		['Do you offer free shipping?', 'Yes! Orders over $50 get free standard shipping.'],
		['How can I track my order?', 'Check your email for tracking or log into your account.'],
		['What payment methods do you accept?', 'Visa, Mastercard, Amex, PayPal, Apple Pay, Google Pay.'],
		['Do you have a warranty?', 'All products have manufacturer warranty. Extended plans available.'],
		['Can I cancel my order?', 'Within 1 hour if not processed. Otherwise return after delivery.'],
		['Do you ship internationally?', 'Yes, 50+ countries. 7-14 days. Duties paid by customer.'],
	];

	try {
		const vectors = await Promise.all(
			FAQsSeedData.map(async ([question, answer], index) => {
				const e = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
					text: [question + ' ' + answer],
				});

				return {
					id: `faq-${index + 1}`,
					values: e.data?.[0] || [],
					metadata: {
						question,
						answer,
					},
				};
			}),
		);

		await env.VECTORIZE.upsert(vectors);

		return jsonResponse({
			success: true,
			count: FAQsSeedData.length,
		});
	} catch (error) {
		return jsonResponse({ error: 'Seed failed' }, 500);
	}
}
