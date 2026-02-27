export default async function FAQ(env, question) {
	try {
		const questionEmbeddingResponse = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
			text: [question],
		}); //converting unstructured 'question' string to it's numerical data point representation for use by the vector. @cf/baai/bge-base-en-v1.5 model handles this for us

		if (!questionEmbeddingResponse.data) return '';

		// vector database query (AKA Retrieval in RAG)
		const vectorSearchResult = await env.VECTORIZE.query(questionEmbeddingResponse.data[0], {
			topK: 3, //return top 3 matches
			returnMetadata: 'all',
		});

		if (!vectorSearchResult.matches?.length) return '';

		return vectorSearchResult.matches
			.map((match) => `Question: ${match.metadata?.question}\nAnswer: ${match.metadata?.answer}`)
			.join('\n\n');
	} catch (error) {
		throw new Error('FAQ retrieval failed: ' + error);
	}
}
