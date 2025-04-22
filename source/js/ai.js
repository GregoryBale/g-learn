const API_URL = 'https://api.paxsenix.biz.id/ai/copilot?text=';
const COOKIE_NAME = 'ai_chat_history';
const COOKIE_DAYS = 30;

// Utility to set cookies
function setCookie(name, value, days) {
    let expires = '';
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + (value || '') + expires + '; path=/; SameSite=Strict';
}

// Utility to get cookies
function getCookie(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Utility to escape HTML
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Simple markdown to HTML converter
function markdownToHtml(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
}

// Inject CSS for the chat button and window
function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
.ai-chat-btn {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(91, 127, 255, 0.8);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50px;
    padding: 12px;
    cursor: pointer;
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.3);
    z-index: 1000;
    transition: all 0.4s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.ai-chat-btn:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(31, 38, 135, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.4);
}

.ai-chat-btn svg {
    width: 24px;
    height: 24px;
    animation: pulseGlow 2s infinite;
}

@keyframes pulseGlow {
    0% { filter: drop-shadow(0 0 0px rgba(255, 255, 255, 0.7)); }
    50% { filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.9)); }
    100% { filter: drop-shadow(0 0 0px rgba(255, 255, 255, 0.7)); }
}

.ai-chat-btn.desktop {
    padding: 12px 24px;
    border-radius: 25px;
    background: linear-gradient(135deg, rgba(91, 127, 255, 0.8), rgba(51, 166, 255, 0.8));
    backdrop-filter: blur(10px);
}

.ai-chat-btn.desktop span {
    margin-left: 10px;
    font-family: 'Manrope', sans-serif;
    font-size: 16px;
    font-weight: 500;
    letter-spacing: 0.5px;
}

.ai-chat-window {
    position: fixed;
    bottom: 90px;
    right: 20px;
    width: 380px;
    height: 540px;
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 24px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
    display: flex;
    flex-direction: column;
    z-index: 1001;
    overflow: hidden;
    font-family: 'Manrope', sans-serif;
    transition: all 0.3s ease;
    /* Скрыто по умолчанию */
    display: none;
}

.ai-chat-window.visible {
    display: flex;
    animation: slideUp 0.3s ease-out forwards;
}

@keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.ai-chat-window.mobile {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    border-radius: 0;
}

.ai-chat-header {
    background: linear-gradient(135deg, rgba(91, 127, 255, 0.9), rgba(51, 166, 255, 0.9));
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    color: white;
    padding: 18px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.ai-chat-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    display: flex;
    align-items: center;
}

.ai-chat-header h3 svg {
    margin-right: 10px;
    width: 22px;
    height: 22px;
    filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.5));
}

.ai-chat-header button {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
}

.ai-chat-header button:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
}

.ai-chat-messages {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    background: rgba(249, 249, 249, 0.2);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    scrollbar-width: thin;
    scrollbar-color: rgba(91, 127, 255, 0.5) transparent;
}

.ai-chat-messages::-webkit-scrollbar {
    width: 6px;
}

.ai-chat-messages::-webkit-scrollbar-thumb {
    background-color: rgba(91, 127, 255, 0.5);
    border-radius: 10px;
}

.message {
    margin-bottom: 18px;
    display: flex;
    align-items: flex-start;
    animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.message.user {
    justify-content: flex-end;
}

.message-content {
    max-width: 80%;
    padding: 12px 18px;
    border-radius: 18px;
    position: relative;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    transition: all 0.2s ease;
}

.message.user .message-content {
    background: linear-gradient(135deg, rgba(91, 127, 255, 0.9), rgba(51, 166, 255, 0.9));
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    color: white;
    border-bottom-right-radius: 4px;
    margin-left: 20px;
}

.message.ai .message-content {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    color: #333;
    border: 1px solid rgba(220, 220, 220, 0.5);
    border-bottom-left-radius: 4px;
    margin-right: 20px;
}

.message-content:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.message-actions {
    display: none;
    position: absolute;
    top: -30px;
    right: 0;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border-radius: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
    padding: 6px 10px;
    transition: all 0.3s ease;
    animation: fadeIn 0.2s ease;
}

.message:hover .message-actions {
    display: flex;
}

.message-actions button {
    background: none;
    border: none;
    cursor: pointer;
    margin: 0 5px;
    font-size: 14px;
    color: #5B7FFF;
    transition: transform 0.2s ease;
}

.message-actions button:hover {
    transform: scale(1.2);
}

.ai-chat-input {
    flex-shrink: 0;
    display: flex;
    flex-wrap: nowrap;
    gap: 10px;
    padding: 18px;
    box-sizing: border-box;
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-top: 1px solid rgba(220, 220, 220, 0.5);
}

.ai-chat-input input {
    flex: 1;
    flex-grow: 1;
    min-width: 0;
    padding: 12px 20px;
    border: 1px solid rgba(200, 200, 200, 0.5);
    border-radius: 24px;
    font-size: 15px;
    font-family: 'Manrope', sans-serif;
    outline: none;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    transition: all 0.3s ease;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
}

.ai-chat-input input:focus {
    border-color: rgba(91, 127, 255, 0.5);
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 2px 15px rgba(91, 127, 255, 0.1);
}

.ai-chat-input button {
    background: linear-gradient(135deg, rgba(91, 127, 255, 0.9), rgba(51, 166, 255, 0.9));
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    color: white;
    border: none;
    border-radius: 50%;
    width: 46px;
    height: 46px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(91, 127, 255, 0.3);
}

.ai-chat-input button:hover {
    transform: scale(1.05) rotate(5deg);
    box-shadow: 0 5px 20px rgba(91, 127, 255, 0.4);
}

.ai-chat-clear {
    background: rgba(255, 77, 79, 0.8);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    color: white;
    border: none;
    border-radius: 20px;
    padding: 8px 16px;
    cursor: pointer;
    margin-left: 10px;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.3s ease;
    box-shadow: 0 4px 10px rgba(255, 77, 79, 0.2);
}

.ai-chat-clear:hover {
    background: rgba(255, 77, 79, 0.9);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 77, 79, 0.3);
}

@media (max-width: 768px) {
    .ai-chat-btn.desktop {
        display: none;
    }
    .ai-chat-btn.mobile {
        display: flex;
    }
    .ai-chat-window {
        border-radius: 18px 18px 0 0;
        bottom: 0;
        right: 0;
        left: 0;
        width: 100%;
        height: 80%;
    }
}

@media (min-width: 769px) {
    .ai-chat-btn.mobile {
        display: none;
    }
    .ai-chat-btn.desktop {
        display: flex;
    }
}
    `;
    document.head.appendChild(style);
}

// Create chat button
function createChatButton() {
    const isMobile = window.innerWidth <= 768;
    const button = document.createElement('button');
    button.className = `ai-chat-btn ${isMobile ? 'mobile' : 'desktop'}`;
    button.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2a5 5 0 0 0-5 5v2a5 5 0 0 0 5 5 5 5 0 0 0 5-5V7a5 5 0 0 0-5-5z"/>
            <path d="M12 14v2m-2 0h4"/>
            <circle cx="9" cy="7" r="1"/>
            <circle cx="15" cy="7" r="1"/>
        </svg>
        ${!isMobile ? '<span>ИИ Помощник</span>' : ''}
    `;
    button.addEventListener('click', toggleChatWindow);
    document.body.appendChild(button);
}

// Create chat window
function createChatWindow() {
    const isMobile = window.innerWidth <= 768;
    const chatWindow = document.createElement('div');
    chatWindow.className = `ai-chat-window ${isMobile ? 'mobile' : ''}`;
    chatWindow.innerHTML = `
        <div class="ai-chat-header">
            <h3>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2a5 5 0 0 0-5 5v2a5 5 0 0 0 5 5 5 5 0 0 0 5-5V7a5 5 0 0 0-5-5z"/>
                    <path d="M12 14v2m-2 0h4"/>
                    <circle cx="9" cy="7" r="1"/>
                    <circle cx="15" cy="7" r="1"/>
                </svg>
                ИИ Помощник
            </h3>
            <button onclick="toggleChatWindow()">✖</button>
        </div>
        <div class="ai-chat-messages" id="ai-chat-messages"></div>
        <div class="ai-chat-input">
            <input type="text" id="ai-chat-input" placeholder="Спросите что угодно..." aria-label="Сообщение для ИИ">
            <button onclick="sendMessage()">Отправить</button>
            <button class="ai-chat-clear" onclick="clearChat()">Очистить</button>
        </div>
    `;
    document.body.appendChild(chatWindow);
    loadChatHistory();
}

// Toggle chat window visibility
function toggleChatWindow() {
    const chatWindow = document.querySelector('.ai-chat-window');
    chatWindow.style.display = chatWindow.style.display === 'flex' ? 'none' : 'flex';
}

// Send message to AI and display response
// Send message to AI and display response
async function sendMessage() {
    const input = document.getElementById('ai-chat-input');
    const messagesDiv = document.getElementById('ai-chat-messages');
    const question = input.value.trim();
    if (!question) return;

    // Display user message
    const userMessage = {
        type: 'user',
        content: question,
        timestamp: new Date().toISOString()
    };
    appendMessage(userMessage);
    saveMessage(userMessage);

    input.value = '';
    input.disabled = true;

    // Show typing indicator
    appendTypingIndicator();

    try {
        const response = await fetch(`${API_URL}${encodeURIComponent(question)}`);
        const data = await response.json();
        // Remove typing indicator
        removeTypingIndicator();
        if (data.ok) {
            const aiMessage = {
                type: 'ai',
                content: data.message,
                timestamp: new Date().toISOString()
            };
            appendMessage(aiMessage);
            saveMessage(aiMessage);
        } else {
            appendMessage({
                type: 'ai',
                content: 'Ошибка: Не удалось получить ответ от ИИ.',
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        // Remove typing indicator
        removeTypingIndicator();
        appendMessage({
            type: 'ai',
            content: 'Ошибка: Не удалось подключиться к серверу.',
            timestamp: new Date().toISOString()
        });
    } finally {
        input.disabled = false;
        input.focus();
    }
}// Send message to AI and display response

// Append typing indicator
function appendTypingIndicator() {
  const messagesDiv = document.getElementById('ai-chat-messages');
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message ai typing-indicator';
  typingDiv.id = 'typing-indicator';
  typingDiv.innerHTML = `
      <div class="message-content">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
      </div>
  `;
  messagesDiv.appendChild(typingDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
  const typingIndicator = document.getElementById('typing-indicator');
  if (typingIndicator) {
      typingIndicator.remove();
  }
}

async function sendMessage() {
  const input = document.getElementById('ai-chat-input');
  const messagesDiv = document.getElementById('ai-chat-messages');
  const question = input.value.trim();
  if (!question) return;

  // Display user message
  const userMessage = {
      type: 'user',
      content: question,
      timestamp: new Date().toISOString()
  };
  appendMessage(userMessage);
  saveMessage(userMessage);

  input.value = '';
  input.disabled = true;

  // Show typing indicator
  appendTypingIndicator();

  try {
      const response = await fetch(`${API_URL}${encodeURIComponent(question)}`);
      const data = await response.json();
      // Remove typing indicator
      removeTypingIndicator();
      if (data.ok) {
          const aiMessage = {
              type: 'ai',
              content: data.message,
              timestamp: new Date().toISOString()
          };
          appendMessage(aiMessage);
          saveMessage(aiMessage);
      } else {
          appendMessage({
              type: 'ai',
              content: 'Ошибка: Не удалось получить ответ от ИИ.',
              timestamp: new Date().toISOString()
          });
      }
  } catch (error) {
      // Remove typing indicator
      removeTypingIndicator();
      appendMessage({
          type: 'ai',
          content: 'Ошибка: Не удалось подключиться к серверу.',
          timestamp: new Date().toISOString()
      });
  } finally {
      input.disabled = false;
      input.focus();
  }
}

// Append message to chat
function appendMessage(message) {
    const messagesDiv = document.getElementById('ai-chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.type}`;
    const formattedContent = markdownToHtml(escapeHtml(message.content));
    messageDiv.innerHTML = `
        <div class="message-content">${formattedContent}</div>
        <div class="message-actions">
            <button onclick="copyMessage(this)" title="Копировать">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M8 4v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H8z"/>
                    <path d="M4 8h2m0 0v8a2 2 0 0 0 2 2h2"/>
                </svg>
            </button>
            <button onclick="shareMessage(this)" title="Поделиться">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 8l4 4m0 0l-4 4m4-4H7"/>
                    <path d="M2 12h3"/>
                </svg>
            </button>
        </div>
    `;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Save message to cookies
function saveMessage(message) {
    let history = getCookie(COOKIE_NAME);
    history = history ? JSON.parse(history) : [];
    history.push(message);
    setCookie(COOKIE_NAME, JSON.stringify(history), COOKIE_DAYS);
}

// Load chat history from cookies
function loadChatHistory() {
    const history = getCookie(COOKIE_NAME);
    if (history) {
        const messages = JSON.parse(history);
        messages.forEach(appendMessage);
    }
}

// Clear chat history
function clearChat() {
    if (confirm('Вы уверены, что хотите очистить историю чата?')) {
        setCookie(COOKIE_NAME, '', -1);
        const messagesDiv = document.getElementById('ai-chat-messages');
        messagesDiv.innerHTML = '';
    }
}

// Copy message to clipboard
function copyMessage(button) {
    const content = button.closest('.message').querySelector('.message-content').textContent;
    navigator.clipboard.writeText(content).then(() => {
        alert('Сообщение скопировано!');
    });
}

// Share message
function shareMessage(button) {
    const content = button.closest('.message').querySelector('.message-content').textContent;
    if (navigator.share) {
        navigator.share({
            title: 'Сообщение от ИИ Помощника',
            text: content,
            url: window.location.href
        }).catch(() => {
            alert('Ошибка при попытке поделиться.');
        });
    } else {
        alert('Поделиться не поддерживается в этом браузере.');
    }
}

// Initialize chat
document.addEventListener('DOMContentLoaded', () => {
    injectStyles();
    createChatButton();
    createChatWindow();

    // Handle Enter key for sending message
    document.getElementById('ai-chat-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Handle window resize for mobile/desktop button
    window.addEventListener('resize', () => {
        const button = document.querySelector('.ai-chat-btn');
        const chatWindow = document.querySelector('.ai-chat-window');
        const isMobile = window.innerWidth <= 768;
        button.className = `ai-chat-btn ${isMobile ? 'mobile' : 'desktop'}`;
        button.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2a5 5 0 0 0-5 5v2a5 5 0 0 0 5 5 5 5 0 0 0 5-5V7a5 5 0 0 0-5-5z"/>
                <path d="M12 14v2m-2 0h4"/>
                <circle cx="9" cy="7" r="1"/>
                <circle cx="15" cy="7" r="1"/>
            </svg>
            ${!isMobile ? '<span>ИИ Помощник</span>' : ''}
        `;
        chatWindow.className = `ai-chat-window ${isMobile ? 'mobile' : ''}`;
    });
});
