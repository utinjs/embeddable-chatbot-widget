# AI Chatbot Widget

A full-stack, embeddable AI Chatbot built on top of Cloudflare Workers. It uses Cloudflare Workers AI for natural language processing, Cloudflare Vectorize for RAG (Retrieval-Augmented Generation) based on an FAQ knowledge base, Cloudflare KV for session history, and Tailwind CSS for the frontend UI.

## Technologies Used

*   **Cloudflare Workers:** Serverless execution environment for the backend API and static asset serving.
*   **Cloudflare Workers AI:** 
    *   `@cf/meta/llama-3-8b-instruct`: Large Language Model powering the chat responses.
    *   `@cf/baai/bge-base-en-v1.5`: Embedding model to vectorize FAQ content for context retrieval.
*   **Cloudflare Vectorize:** Vector database to store and query FAQ embeddings.
*   **Cloudflare KV:** Key-Value store to maintain conversation history across sessions.
*   **Tailwind CSS:** Utility-first CSS framework used for styling the widget UI.
*   **Vanilla JavaScript:** Lightweight frontend widget script without heavy framework dependencies.

## Project Structure

```text
├── src/                  # Cloudflare Worker Backend code
│   ├── index.js          # API Routes & Worker Entrypoint
│   ├── index.css         # Tailwind source css file
│   └── utils/            # API Handlers and Utilities
│       ├── chat.js       # Core chat logic and Llama-3 stream integration
│       ├── seed.js       # Seeding Vectorize DB with FAQs
│       └── ...
├── public/               # Static Frontend Assets
│   ├── index.html        # Demo HTML page for testing the widget
│   ├── widget.js         # The IIFE script to embed in any web page
│   └── styles.css        # Compiled Tailwind CSS (generated on build)
├── package.json          # Node dependencies and scripts
└── wrangler.jsonc        # Cloudflare configuration file
```

## How It Works

1.  **FrontendWidget:** `widget.js` creates an interactive chat UI on the client's web page. It persists a `chatbot_session` cookie to remember users.
2.  **API Routing:** Requests to `/api/chat` hit the Cloudflare Worker. The Worker retrieves the user's history from KV.
3.  **RAG Context:** The backend converts the user's question into embeddings and queries Vectorize for the most relevant FAQs.
4.  **AI Response:** The fetched FAQ context and the chat history are passed to Workers AI (Llama 3), which streams the response back to the client via Server-Sent Events (SSE).

## Local Development

### Prerequisites

*   Node.js and npm installed.
*   A Cloudflare account and Wrangler CLI authenticated (`npx wrangler login`).

### Setup Instructions

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Set up Cloudflare Resources:**
    You need to create a KV Namespace and a Vectorize Index on your Cloudflare account to bind them in `wrangler.jsonc`.

    ```bash
    # Create KV Namespace
    npx wrangler kv:namespace create CHAT_SESSIONS

    # Create Vectorize Index
    npx wrangler vectorize create faq-vectors --dimensions=768 --metric=cosine
    ```
    *Update your `wrangler.jsonc` with the newly generated `id` for your KV namespace.*

3.  **Start the Development Server:**
    ```bash
    npm run dev
    ```
    This command builds the Tailwind CSS and starts the `wrangler dev` environment. You can access the demo page at `http://localhost:8787` (port may vary).

4.  **Seed the Database:**
    Before asking questions, populate the Vectorize database with the initial FAQs (found in `src/utils/seed.js`). Run the following curl command while your dev server is running:
    ```bash
    curl -X POST http://localhost:8787/api/seed
    ```

## Embedding the Widget

To embed this chatbot on any website, include the following tags before the closing `</body>` tag of your HTML:

```html
<!-- 1. Include the stylesheet -->
<link rel="stylesheet" href="https://<YOUR_WORKER_URL>.workers.dev/styles.css" />

<!-- 2. Configure the chatbot globally -->
<script>
    window.CHATBOT_BASE_URL = 'https://<YOUR_WORKER_URL>.workers.dev';
    window.CHATBOT_TITLE = 'Support';
    window.CHATBOT_GREETING = "👋 Hi! I'm here to help with your questions!";
</script>

<!-- 3. Load the widget script -->
<script src="https://<YOUR_WORKER_URL>.workers.dev/widget.js"></script>
```

*Make sure to replace `https://<YOUR_WORKER_URL>.workers.dev` with your actual deployed Worker URL.*
