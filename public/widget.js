/*
An Immediately Invoked Function that does the following:
1. 
2. 
3.
4.
5.
6.
7.
*/

(function () {
	('use strict');

	const Config = {
		url: window.CHATBOT_BASE_URL || '',
		title: window.CHATBOT_TITLE || 'AI Assistant',
		placeholder: window.CHATBOT_PLACEHOLDER || 'Message...',
		greeting: window.CHATBOT_GREETING || '👋 Hi! How can I help you today?',
	};

	let isOpen = 0,
		messages = [],
		isTyping = 0,
		isMenuOpen = 0;
	const isDark = matchMedia('(prefers-color-scheme:dark)').matches;

	const getElementByID = (id) => document.getElementById(id);
	const handleToggle = (el, elClass, on) => el.classList.toggle(elClass, on);
	// example use-case of handleToggle
	// handleToggle(getElementByID('cb-d'), 'hidden', !isMenuOpen)

	function init() {
		const linkEl = document.createElement('link');
		linkEl.rel = 'stylesheet';
		linkEl.href = Config.url + '/styles.css';
		document.head.appendChild(linkEl);

		const divEl = document.createElement('div');
		divEl.id = 'cb';
		divEl.innerHTML = `
        <button id="cb-btn" class="fixed bottom-6 right-6 w-14 h-14 bg-black rounded-full shadow-2xl flex items-center justify-center cursor-pointer hover:scale-110 transition-all z-[99999]">
        <svg id="cb-o" class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
        </svg>
        <svg id="cb-x" class="w-6 h-6 text-white absolute opacity-0 scale-50 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      <div id="cb-w" class="fixed bottom-24 right-6 w-[400px] h-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[99999] opacity-0 scale-95 pointer-events-none transition-all origin-bottom-right bg-white dark:bg-gray-900">
        
        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-black rounded-full flex items-center justify-center">
              <span class="text-white font-bold text-lg">C</span>
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white">${Config.title}</h3>
          </div>
          <div class="relative">
            <button id="cb-m" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
              <svg class="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
              </svg>
            </button>
            <div id="cb-d" class="hidden absolute right-0 top-full mt-2 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-50">
              <button id="cb-th" class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                <svg id="cb-s" class="w-4 h-4 hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/></svg>
                <svg id="cb-n" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
                <span id="cb-tt">Dark Mode</span>
              </button>
              <button id="cb-cl" class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                </svg>
                Clear Chat
              </button>
            </div>
          </div>
        </div>

        <!-- Messages -->
        <div id="cb-ms" class="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-gray-50 dark:bg-gray-950"></div>
        
        <!-- Typing Indicator -->
        <div id="cb-ty" class="hidden px-5 pb-2 bg-gray-50 dark:bg-gray-950">
          <div class="flex items-center gap-2 text-gray-400 text-sm">
            <div class="flex gap-1">
              <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:.15s"></span>
              <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:.3s"></span>
            </div>
            Thinking...
          </div>
        </div>

        <!-- Input -->
        <form id="cb-f" class="flex items-center gap-3 px-4 py-4 border-t bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
          <input id="cb-i" type="text" class="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600" placeholder="${Config.placeholder}" autocomplete="off"/>
          <button type="submit" id="cb-se" class="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full disabled:opacity-50">
            <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"/>
            </svg>
          </button>
        </form>
        </div>
        `;
		document.body.appendChild(divEl);

		// TODO: invoke bind, load, and theme functions
		bind();
		load();
		theme();
	}

	// binds elements of interest to specfic events and corresponding actions/callbacks
	function bind() {
		getElementByID('cb-btn').onclick = flip; //TODO: create a flip fxn

		getElementByID('cb-f').onsubmit = send; //TODO: create the send fxn

		getElementByID('cb-m').onclick = (e) => {
			e.stopPropagation();
			isMenuOpen = !isMenuOpen;
			handleToggle(getElementByID('cb-d'), 'hidden', !isMenuOpen);
		};

		getElementByID('cb-th').onclick = () => {
			isDark = !isDark;
			theme();
			isMenuOpen = 0;
			handleToggle(getElementByID('cb-d'), 'hidden', 1);
		};

		getElementByID('cb-cl').onclick = () => {
			messages = [];
			draw(); //TODO: create the draw fxn
			isMenuOpen = 0;
			handleToggle(getElementByID('cb-d'), 'hidden', 1);
		};

		// TODO: what exactly does this do???
		// when anywhere in the document is clicked, menu is hidden at first, then the hidden class is toggled in the cb-d el?
		document.onclick = () => {
			if (isMenuOpen) {
				isMenuOpen = 0;

				handleToggle(getElementByID('cb-d'), 'hidden', 1);
			}
		};
	}

	function theme() {
		handleToggle(getElementByID('cb'), 'dark', isDark);

		getElementByID('cb-tt').textContent = isDark ? 'Light Mode' : 'Dark Mode';

		handleToggle(getElementByID('cb-s'), 'hidden', !isDark);
		handleToggle(getElementByID('cb-n'), 'hidden', isDark);
	}

	function flip() {
		isOpen = !isOpen;

		const w = getElementByID('cb-w'),
			o = getElementByID('cb-o'),
			x = getElementByID('cb-x');

		handleToggle(w, 'opacity-0', !isOpen);
		handleToggle(w, 'scale-95', !isOpen);
		handleToggle(w, 'pointer-events-none', !isOpen);
		handleToggle(w, 'opacity-100', isOpen);
		handleToggle(w, 'scale-100', isOpen);

		handleToggle(o, 'opacity-0', isOpen);
		handleToggle(o, 'scale-50', isOpen);

		handleToggle(x, 'opacity-0', !isOpen);
		handleToggle(x, 'scale-50', !isOpen);
		handleToggle(x, 'opacity-100', isOpen);
		handleToggle(x, 'scale-100', isOpen);

		if (isOpen) {
			getElementByID('cb-i').focus();

			if (!messages.length) {
				add('assistant', Config.greeting); //TODO: create the add fxn
			}
		}
	}

	function add(role, content) {
		messages.push({ role, content });

		draw(); //TODO: create the draw fxn
	}

	function esc(text) {
		const divEl = document.createElement('div');
		divEl.textContent = text;
		return divEl.innerHTML.replace(/\n/g, '<br>');
	}

	function draw() {
		getElementByID('cb-ms').innerHTML = messages
			.map((message, index) =>
				message.role === 'user'
					? `<div class="flex justify-end">
          <div class="bg-black text-white rounded-2xl rounded-br-md px-4 py-3 max-w-[85%]">
            <div id="m${index}" class="text-sm whitespace-pre-wrap">${esc(message.content)}</div>
          </div>
        </div>`
					: `<div class="flex justify-start">
          <div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%] border border-gray-200 dark:border-gray-700 shadow-sm">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                <span class="text-white font-bold text-xs">C</span>
              </div>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">${Config.title}</span>
            </div>
            <div id="m${index}" class="text-sm leading-relaxed whitespace-pre-wrap">${esc(message.content)}</div>
          </div>
        </div>`,
			)
			.join('');

		getElementByID('cb-ms').scrollTop = getElementByID('cb-ms').scrollHeight; //TODO: understand what this line does
	}

	async function send(e) {
		e.preventDefault();

		const message = getElementByID('cb-i').value.trim();
		if (!message || isTyping) return;

		add('user', message);

		getElementByID('cb-i').value = '';
		getElementByID('cb-se').disabled = 1;
		isTyping = 1;
		handleToggle(getElementByID('cb-ty'), 'hidden', 0);

		try {
			// using user's input to make an API request to the chat endpoint
			const result = await fetch(Config.url + '/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message }),
				credentials: 'include',
			});

			if (!result.ok) throw 0;

			// TODO: what's going on here?
			const rd = result.body.getReader();
			const dc = new TextDecoder();

			let t = '',
				idx = null;

			while (1) {
				const { done, value } = await rd.read();

				if (done) break;

				for (const ln of dc.decode(value, { stream: 1 }).split('\n')) {
					if (!ln.startsWith('data:')) continue;

					const d = ln.slice(6);
					if (d === '[DONE]') continue;

					try {
						const p = JSON.parse(d);

						if (p.response) {
							t += p.response;

							if (idx === null) {
								handleToggle(getElementByID('cb-ty'), 'hidden', 1);
								isTyping = 0;
								messages.push({
									role: 'assistant',
									content: t,
								});

								idx = messages.length - 1;
								draw();
							} else {
								messages[idx].content = t;
								const el = getElementByID('m' + idx);

								if (el) el.innerHTML = esc(t);
							}

							getElementByID('cb-ms').scrollTop = getElementByID('cb-ms').scrollHeight;
						}
					} catch (error) {}
				}
			}
		} catch (error) {
			handleToggle(getElementByID('cb-ty'), 'hidden', 1);
			isTyping = 0;
			add('assistant', 'Sorry, an error occured.');
		} finally {
			getElementByID('cb-se').disabled = 0;
			isTyping = 0;
			handleToggle(getElementByID('cb-ty'), 'hidden', 1);
		}
	}

	// loader funxtion
	async function load() {
		try {
			const r = await fetch(Config.url + '/api/history', {
				credentials: 'include',
			});

			if (r.ok) {
				const d = await r.json();
				if (d.messages?.length) {
					messages = d.messages;
					draw();
				}
			}
		} catch (error) {}
	}

	document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init(); //in either case, init funcion gets called
})();
