const API_URL = 'https://api.paxsenix.biz.id/ai/copilot?text=';
const COOKIE_NAME = 'ai_chat_history';
const COOKIE_DAYS = 30;
const MAX_HISTORY_SIZE = 100; // Limit chat history size

const i18n = {
    ru: {
        assistantName: 'ИИ Помощник',
        placeholder: 'Напишите сообщение...',
        clearChat: 'Очистить',
        settings: 'Настройки',
        fontSize: 'Размер шрифта',
        chatColor: 'Основной цвет',
        chatBehavior: 'Поведение чата',
        cancel: 'Отмена',
        save: 'Сохранить',
        darkTheme: 'Темная тема',
        welcomeMessage: 'Привет! 👋 Я ваш ИИ-помощник с современным дизайном Windows 11. Чем я могу вам помочь сегодня?',
        clearConfirm: 'Вы уверены, что хотите очистить всю историю чата?',
        emptyHistory: 'История чата пуста.',
        copySuccess: 'Текст скопирован в буфер обмена!',
        copyError: 'Не удалось скопировать текст.',
        voiceError: 'Ваш браузер не поддерживает голосовой ввод.',
        speechError: 'Ошибка распознавания речи.',
        noInternet: 'Нет подключения к интернету.'
    }
    // Add other languages here, e.g., en: { ... }
};

function getText(key) {
    const lang = 'ru'; // Could be dynamic based on user preference
    return i18n[lang][key] || key;
}

// Utility functions
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = days ? `; expires=${date.toUTCString()}` : '';
    document.cookie = `${name}=${encodeURIComponent(value || '')}${expires}; path=/; SameSite=Strict`;
}

function getCookie(name) {
    const nameEQ = `${name}=`;
    return document.cookie.split(';')
        .map(c => c.trim())
        .find(c => c.startsWith(nameEQ))
        ?.substring(nameEQ.length) || null;
}

// Enhanced markdown parser with code block support
function markdownToHtml(text) {
    // Handle code blocks first
    text = text.replace(/```(.*?)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');
    
    // Handle inline formatting
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/\n/g, '<br>');
}

// Inject CSS for the chat interface with Windows 11 style
function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Segoe+UI:wght@300;400;500;600;700&display=swap');
        
        :root {
            --win11-primary: #0078d4;
            --win11-accent: #60cdff;
            --win11-bg: rgba(243, 243, 243, 0.85);
            --win11-card: rgba(255, 255, 255, 0.7);
            --win11-text: #202020;
            --win11-border: rgba(200, 200, 200, 0.5);
            --win11-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
            --win11-glass: blur(25px);
            --win11-transition: all 0.3s cubic-bezier(0.17, 0.84, 0.44, 1);
        }
        
        /* Chat button */
.ai-chat-btn {
    position: fixed;
    bottom: 30px;
    right: 30px;
    background: linear-gradient(145deg, #0078d4, #00b7eb, #10aeff);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    border: none;
    border-radius: 50px;
    padding: 14px 22px;
    cursor: pointer;
    box-shadow: 0 6px 20px rgba(0, 120, 212, 0.3);
    z-index: 10000;
    transition: all 0.3s cubic-bezier(0.17, 0.84, 0.44, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    font-family: 'Segoe UI', sans-serif;
}

.ai-chat-btn:hover {
    transform: scale(1.1) translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 120, 212, 0.5);
    background: linear-gradient(145deg, #10aeff, #0078d4);
}
        
      .ai-chat-btn.desktop span {
    color: white;
    font-size: 16px;
    font-weight: 500;
    letter-spacing: 0.3px;
}
        
.ai-chat-btn svg {
    width: 28px;
    height: 28px;
    stroke: white;
    fill: none;
    transition: all 0.3s ease;
    animation: rotateGlow 4s infinite ease-in-out;
}
        
@keyframes rotateGlow {
    0% { transform: rotate(0deg); filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.5)); }
    50% { transform: rotate(180deg); filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.8)); }
    100% { transform: rotate(360deg); filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.5)); }
}

        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        /* Chat window */
        .ai-chat-window {
            position: fixed;
            bottom: 100px;
            right: 30px;
            width: 420px;
            height: 600px;
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid var(--win11-border);
            border-radius: 12px;
            box-shadow: var(--win11-shadow);
            display: none;
            flex-direction: column;
            z-index: 10001;
            overflow: hidden;
            font-family: 'Segoe UI', sans-serif;
            transition: var(--win11-transition);
            animation: slideIn 0.3s forwards;
        }
        
@keyframes slideIn {
    from { opacity: 0; transform: translateY(30px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}
        
        .ai-chat-window.visible {
            display: flex;
        }
        
        /* Window header */
        .ai-chat-header {
            background: linear-gradient(145deg, #0078d4, #00b7eb, #0091ff);
            backdrop-filter: var(--win11-glass);
            -webkit-backdrop-filter: var(--win11-glass);
            padding: 16px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
        }
        
        .ai-chat-header h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .ai-chat-header svg {
    width: 24px;
    height: 24px;
    stroke: white;
    fill: none;
    animation: pulseGlow 2s infinite ease-in-out;
}

@keyframes pulseGlow {
    0% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.5)); }
    50% { transform: scale(1.15); filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.8)); }
    100% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.5)); }
}        

        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }
        
        .ai-chat-header .controls {
            display: flex;
            gap: 8px;
        }
        
        .ai-chat-header button {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            border-radius: 8px;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .ai-chat-header button:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: scale(1.1);
        }
        
        .ai-chat-header button svg {
            width: 16px;
            height: 16px;
            animation: none;
        }
        
        /* Messages area */
        .ai-chat-messages {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            background: rgba(245, 245, 245, 0.5);
            backdrop-filter: var(--win11-glass);
            -webkit-backdrop-filter: var(--win11-glass);
            scroll-behavior: smooth;
        }
        
        .ai-chat-messages::-webkit-scrollbar {
            width: 8px;
        }
        
        .ai-chat-messages::-webkit-scrollbar-thumb {
            background-color: rgba(0, 120, 212, 0.4);
            border-radius: 10px;
        }
        
        .ai-chat-messages::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.05);
            border-radius: 10px;
        }
        
        /* Message styles */
        .message {
            margin-bottom: 20px;
            display: flex;
            align-items: flex-start;
            animation: fadeIn 0.4s ease-out;
            position: relative;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .message.user {
            justify-content: flex-end;
        }
        
.message .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    margin-right: 12px;
    background: linear-gradient(145deg, #0078d4, #10aeff);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}
        
.message.user .avatar {
    order: 1;
    margin-right: 0;
    margin-left: 12px;
    background: linear-gradient(145deg, #6b6b6b, #8e8e8e);
}

.message .avatar svg {
    width: 20px;
    height: 20px;
    stroke: white;
    fill: none;
}

.message.ai .avatar:hover {
    transform: scale(1.1);
    filter: drop-shadow(0 0 4px rgba(0, 120, 212, 0.5));
}

.message.user .avatar:hover {
    transform: scale(1.1);
    filter: drop-shadow(0 0 4px rgba(107, 107, 107, 0.5));
}

        .message-content {
            max-width: 70%;
            padding: 14px 18px;
            border-radius: 12px;
            position: relative;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            transition: var(--win11-transition);
            font-size: 15px;
            line-height: 1.5;
            color: var(--win11-text);
        }
        
        .message.ai .message-content {
            background: rgba(255, 255, 255, 0.8);
            border: 1px solid rgba(0, 120, 212, 0.1);
            border-top-left-radius: 4px;
        }
        
        .message.user .message-content {
            background: rgba(0, 120, 212, 0.1);
            border: 1px solid rgba(0, 120, 212, 0.2);
            border-top-right-radius: 4px;
        }
        
        .message-content:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .message-timestamp {
            font-size: 11px;
            color: rgba(0, 0, 0, 0.5);
            margin-top: 5px;
            text-align: right;
        }
        
        /* Code formatting */
        .message-content pre {
            background: rgba(30, 30, 30, 0.9);
            border-radius: 6px;
            padding: 12px;
            overflow-x: auto;
            margin: 10px 0;
        }
        
        .message-content code {
            font-family: 'Consolas', monospace;
            color: #e0e0e0;
            font-size: 14px;
        }
        
        .message-content p code {
            background: rgba(0, 0, 0, 0.05);
            padding: 2px 5px;
            border-radius: 4px;
            color: var(--win11-text);
        }
        
        /* Message actions */
        .message-actions {
            position: absolute;
            top: -30px;
            right: 10px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border-radius: 20px;
            box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
            padding: 6px;
            display: none;
            gap: 6px;
            transition: all 0.2s ease;
        }
        
        .message:hover .message-actions {
            display: flex;
        }
        
        .message-actions button {
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 5px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        }
        
        .message-actions button:hover {
            background: rgba(0, 120, 212, 0.1);
            transform: scale(1.1);
        }
        
        .message-actions button svg {
            width: 16px;
            height: 16px;
            fill: #0078d4;
        }
        
        /* Input area */
        .ai-chat-input-container {
            padding: 16px;
            background: rgba(245, 245, 245, 0.7);
            backdrop-filter: var(--win11-glass);
            -webkit-backdrop-filter: var(--win11-glass);
            border-top: 1px solid var(--win11-border);
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .ai-chat-input-wrapper {
            display: flex;
            gap: 12px;
            align-items: flex-end;
        }
        
.ai-chat-input {
    flex: 1;
    min-height: 50px;
    max-height: 150px;
    padding: 14px 20px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    font-family: 'Segoe UI', sans-serif;
    font-size: 15px;
    line-height: 1.5;
    outline: none;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    resize: none;
    overflow-y: auto;
    transition: all 0.2s ease;
}
        
.ai-chat-input:focus {
    border-color: #0078d4;
    box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.2);
    background: rgba(255, 255, 255, 0.95);
}
        
        .ai-chat-buttons {
            display: flex;
            gap: 10px;
        }
        
        .ai-chat-send {
            background: linear-gradient(145deg, #0078d4, #10aeff);
            border: none;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(0, 120, 212, 0.3);
        }
        
        .ai-chat-send:hover {
            transform: scale(1.05) rotate(10deg);
            box-shadow: 0 6px 16px rgba(0, 120, 212, 0.4);
        }
        
        .ai-chat-send svg {
            width: 22px;
            height: 22px;
            fill: white;
        }
        
        .ai-chat-toolbar {
            display: flex;
            justify-content: space-between;
            padding: 0 5px;
        }
        
        .ai-chat-tools {
            display: flex;
            gap: 10px;
        }
        
        .ai-chat-tool {
            background: rgba(0, 120, 212, 0.1);
            border: none;
            border-radius: 6px;
            padding: 6px 12px;
            font-size: 13px;
            color: #0078d4;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 5px;
            transition: all 0.2s ease;
        }
        
        .ai-chat-tool:hover {
            background: rgba(0, 120, 212, 0.2);
            transform: translateY(-2px);
        }
        
        .ai-chat-tool svg {
            width: 14px;
            height: 14px;
            fill: #0078d4;
        }
        
        /* Typing indicator */
        .typing-indicator {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .typing-indicator .dots {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 10px 16px;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 18px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .typing-indicator .dot {
            width: 8px;
            height: 8px;
            background: #0078d4;
            border-radius: 50%;
            animation: bounce 1.5s infinite ease-in-out;
        }
        
        .typing-indicator .dot:nth-child(1) { animation-delay: 0s; }
        .typing-indicator .dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator .dot:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes bounce {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-6px); }
        }
        
        /* Voice input button */
        .ai-chat-voice {
            background: linear-gradient(145deg, #e74c3c, #c0392b);
            border: none;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
        }
        
        .ai-chat-voice:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 16px rgba(231, 76, 60, 0.4);
        }
        
        .ai-chat-voice svg {
            width: 22px;
            height: 22px;
            fill: white;
        }
        
        .ai-chat-voice.recording {
            animation: pulse-red 1.5s infinite;
        }
        
        @keyframes pulse-red {
            0% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7); }
            70% { box-shadow: 0 0 0 15px rgba(231, 76, 60, 0); }
            100% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0); }
        }
        
        /* Settings panel */
        .ai-chat-settings {
            position: absolute;
            top: 58px;
            right: 10px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: var(--win11-glass);
            -webkit-backdrop-filter: var(--win11-glass);
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
            padding: 15px;
            width: 250px;
            z-index: 10002;
            display: none;
            animation: fadeIn 0.2s forwards;
        }
        
        .ai-chat-settings h4 {
            margin: 0 0 15px 0;
            font-size: 16px;
            font-weight: 500;
            color: #333;
        }
        
        .settings-option {
            margin-bottom: 15px;
        }
        
        .settings-option label {
            display: block;
            margin-bottom: 6px;
            font-size: 14px;
            color: #555;
        }
        
        .settings-option select,
        .settings-option input[type="color"] {
            width: 100%;
            padding: 8px 10px;
            border: 1px solid rgba(0, 0, 0, 0.1);
            border-radius: 6px;
            background: white;
            font-family: 'Segoe UI', sans-serif;
        }
        
        .settings-buttons {
            display: flex;
            justify-content: space-between;
            margin-top: 15px;
        }
        
        .settings-buttons button {
            padding: 8px 15px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s ease;
        }
        
        .settings-save {
            background: #0078d4;
            color: white;
        }
        
        .settings-save:hover {
            background: #0086ef;
        }
        
        .settings-cancel {
            background: rgba(0, 0, 0, 0.1);
            color: #333;
        }
        
        .settings-cancel:hover {
            background: rgba(0, 0, 0, 0.2);
        }
        
        /* Toggle for dark mode */
        .theme-toggle {
            display: flex;
            align-items: center;
        }
        
        .theme-toggle input[type="checkbox"] {
            height: 0;
            width: 0;
            visibility: hidden;
            position: absolute;
        }
        
        .theme-toggle label {
            cursor: pointer;
            width: 50px;
            height: 24px;
            background: #bbb;
            display: block;
            border-radius: 100px;
            position: relative;
            margin-right: 10px;
        }
        
        .theme-toggle label:after {
            content: '';
            position: absolute;
            top: 3px;
            left: 3px;
            width: 18px;
            height: 18px;
            background: #fff;
            border-radius: 50%;
            transition: 0.3s;
        }
        
        .theme-toggle input:checked + label {
            background: #0078d4;
        }
        
        .theme-toggle input:checked + label:after {
            left: calc(100% - 3px);
            transform: translateX(-100%);
        }
        
        /* Mobile responsive design */
        @media (max-width: 768px) {
            .ai-chat-btn {
                bottom: 20px;
                right: 20px;
            }
            
            .ai-chat-btn.desktop span {
                display: none;
            }
            
            .ai-chat-window {
                width: 90%;
                height: 80%;
                bottom: 80px;
                right: 5%;
                left: 5%;
            }
            
            .message-content {
                max-width: 85%;
            }
            
            .ai-chat-input {
                padding: 12px 16px;
            }
        }
        
        @media (max-width: 480px) {
            .ai-chat-window {
                width: 100%;
                height: 100%;
                bottom: 0;
                right: 0;
                left: 0;
                border-radius: 0;
            }
            
            .message .avatar {
                width: 28px;
                height: 28px;
            }
            
            .message-content {
                padding: 12px 16px;
                font-size: 14px;
            }
            
            .ai-chat-input-container {
                padding: 12px;
            }
        }
        
        /* Dark mode */
        .dark-mode {
            --win11-bg: rgba(32, 32, 32, 0.85);
            --win11-card: rgba(50, 50, 50, 0.7);
            --win11-text: #e0e0e0;
            --win11-border: rgba(70, 70, 70, 0.5);
        }
        
        .dark-mode .ai-chat-window {
            background: rgba(30, 30, 30, 0.8);
        }
        
        .dark-mode .ai-chat-messages {
            background: rgba(40, 40, 40, 0.5);
        }
        
        .dark-mode .message.ai .message-content {
            background: rgba(60, 60, 60, 0.8);
            border-color: rgba(80, 80, 80, 0.3);
            color: #e0e0e0;
        }
        
        .dark-mode .message.user .message-content {
            background: rgba(0, 120, 212, 0.3);
            border-color: rgba(0, 120, 212, 0.4);
            color: #e0e0e0;
        }
        
        .dark-mode .ai-chat-input-container {
            background: rgba(40, 40, 40, 0.7);
        }
        
        .dark-mode .ai-chat-input {
            background: rgba(60, 60, 60, 0.8);
            border-color: rgba(80, 80, 80, 0.3);
            color: #e0e0e0;
        }
        
        .dark-mode .message-timestamp {
            color: rgba(255, 255, 255, 0.5);
        }
        
        .dark-mode .ai-chat-tool {
            background: rgba(0, 120, 212, 0.2);
            color: #60cdff;
        }
        
        .dark-mode .ai-chat-tool svg {
            fill: #60cdff;
        }
        
        /* Animations and transitions */
        @keyframes win11Animation {
            0% { transform: scale(0.95); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        
        /* Accessibility improvements */
        @media (prefers-reduced-motion: reduce) {
            * {
                animation-duration: 0.001ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.001ms !important;
            }
        }
            /* Add to the injectStyles function */
.message-content h1,
.message-content h2,
.message-content h3 {
    margin: 10px 0;
    font-weight: 500;
    color: var(--win11-text);
}

.message-content h1 {
    font-size: 20px;
}

.message-content h2 {
    font-size: 18px;
}

.message-content h3 {
    font-size: 16px;
}

.message-content ul,
.message-content ol {
    margin: 10px 0;
    padding-left: 20px;
}

.message-content li {
    margin-bottom: 5px;
}

.message-content blockquote {
    border-left: 3px solid var(--win11-primary);
    padding-left: 10px;
    margin: 10px 0;
    color: var(--win11-text);
    font-style: italic;
}
    `;
    document.head.appendChild(style);
}

// Create chat window with enhanced features
// Create chat window with enhanced features
function createChatWindow() {
    const chatWindow = document.createElement('div');
    chatWindow.className = `ai-chat-window ${window.innerWidth <= 768 ? 'mobile' : ''}`;
    chatWindow.innerHTML = `
        <div class="ai-chat-header">
            <h3>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" stroke-opacity="0.7"/>
                    <path d="M12 6v6l4 2" stroke-linecap="round"/>
                    <circle cx="12" cy="12" r="2" fill="currentColor"/>
                    <path d="M8 12h-4m20 0h-4" stroke-linecap="round"/>
                    <path d="M12 4v-2m0 16v2" stroke-linecap="round"/>
                </svg>
                ИИ Помощник
            </h3>
            <div class="controls">
                <button id="ai-chat-close-btn" aria-label="Закрыть">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        </div>
        <div class="ai-chat-messages" id="ai-chat-messages"></div>
        <div class="ai-chat-input-container">
            <div class="ai-chat-toolbar">
                <div class="ai-chat-tools">
                    <button class="ai-chat-tool" id="ai-chat-clear-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Очистить
                    </button>
                </div>
            </div>
            <div class="ai-chat-input-wrapper">
                <textarea class="ai-chat-input" id="ai-chat-input" placeholder="Напишите сообщение..." aria-label="Сообщение для ИИ" rows="1"></textarea>
                <div class="ai-chat-buttons">
                    <button class="ai-chat-voice" id="ai-chat-voice-btn" aria-label="Голосовой ввод">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                            <line x1="12" y1="19" x2="12" y2="23"></line>
                            <line x1="8" y1="23" x2="16" y2="23"></line>
                        </svg>
                    </button>
                    <button class="ai-chat-send" id="ai-chat-send-btn" aria-label="Отправить">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        <div class="ai-chat-settings" id="ai-chat-settings">
            <h4>Настройки</h4>
            <div class="settings-option">
                <label for="font-size">Размер шрифта</label>
                <select id="font-size">
                    <option value="small">Маленький</option>
                    <option value="medium" selected>Средний</option>
                    <option value="large">Большой</option>
                </select>
            </div>
            <div class="settings-option">
                <label for="chat-color">Основной цвет</label>
                <input type="color" id="chat-color" value="#0078d4">
            </div>
            <div class="settings-option">
                <label for="chat-behavior">Поведение чата</label>
                <select id="chat-behavior">
                    <option value="standard" selected>Ст標準ное</option>
                    <option value="minimalist">Минималистичное</option>
                    <option value="verbose">Подробное</option>
                </select>
            </div>
            <div class="settings-buttons">
                <button class="settings-cancel" id="settings-cancel">Отмена</button>
                <button class="settings-save" id="settings-save">Сохранить</button>
            </div>
        </div>
    `;
    document.body.appendChild(chatWindow);
    
    // Set up event listeners
    document.getElementById('ai-chat-close-btn').addEventListener('click', toggleChatWindow);
    document.getElementById('ai-chat-send-btn').addEventListener('click', sendMessage);
    document.getElementById('ai-chat-clear-btn').addEventListener('click', clearChat);
    document.getElementById('ai-chat-voice-btn').addEventListener('click', toggleVoiceInput);
    document.getElementById('settings-cancel').addEventListener('click', toggleSettings);
    document.getElementById('settings-save').addEventListener('click', saveSettings);
    
    // Auto-expand textarea and handle Enter key
    const textarea = document.getElementById('ai-chat-input');
    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        if (this.scrollHeight > 150) {
            this.style.overflowY = 'auto';
        } else {
            this.style.overflowY = 'hidden';
        }
    });

    // Handle Enter key for sending message
    textarea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent default newline
            sendMessage(); // Send the message
        }
    });
    
    // Load settings and chat history
    loadSettings();
    loadChatHistory();
    displayWelcomeMessage();
}

// Toggle chat window
function toggleChatWindow() {
    const chatWindow = document.querySelector('.ai-chat-window');
    if (chatWindow.classList.contains('visible')) {
        chatWindow.classList.remove('visible');
        setTimeout(() => {
            chatWindow.style.display = 'none';
        }, 300);
    } else {
        chatWindow.style.display = 'flex';
        setTimeout(() => {
            chatWindow.classList.add('visible');
            document.getElementById('ai-chat-input').focus();
        }, 10);
    }
}

// Toggle settings panel
function toggleSettings() {
    const settingsPanel = document.getElementById('ai-chat-settings');
    settingsPanel.style.display = settingsPanel.style.display === 'block' ? 'none' : 'block';
}

// Save settings
function saveSettings() {
    const fontSize = document.getElementById('font-size').value;
    const chatColor = document.getElementById('chat-color').value;
    const chatBehavior = document.getElementById('chat-behavior').value;
    
    const settings = {
        fontSize,
        chatColor,
        chatBehavior,
        darkMode: document.getElementById('theme-switch').checked
    };
    
    setCookie('ai_chat_settings', JSON.stringify(settings), 365);
    applySettings(settings);
    toggleSettings();
}

// Load settings
function loadSettings() {
    const settingsCookie = getCookie('ai_chat_settings');
    if (settingsCookie) {
        const settings = JSON.parse(settingsCookie);
        document.getElementById('font-size').value = settings.fontSize || 'medium';
        document.getElementById('chat-color').value = settings.chatColor || '#0078d4';
        document.getElementById('chat-behavior').value = settings.chatBehavior || 'standard';
        document.getElementById('theme-switch').checked = settings.darkMode || false;
        
        applySettings(settings);
    } else {
        // Apply default settings
        applySettings({
            fontSize: 'medium',
            chatColor: '#0078d4',
            chatBehavior: 'standard',
            darkMode: false
        });
    }
}

// Apply settings
function applySettings(settings) {
    // Apply font size
    let fontSizeValue;
    switch (settings.fontSize) {
        case 'small': fontSizeValue = '14px'; break;
        case 'large': fontSizeValue = '18px'; break;
        default: fontSizeValue = '16px';
    }
    
    document.documentElement.style.setProperty('--win11-primary', settings.chatColor);
    document.documentElement.style.setProperty('--win11-accent', adjustColorBrightness(settings.chatColor, 30));
    
    const messages = document.querySelectorAll('.message-content');
    messages.forEach(msg => {
        msg.style.fontSize = fontSizeValue;
    });
    
    // Apply dark mode
    if (settings.darkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

// Toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    
    // Save setting
    const settingsCookie = getCookie('ai_chat_settings');
    const settings = settingsCookie ? JSON.parse(settingsCookie) : {};
    settings.darkMode = document.body.classList.contains('dark-mode');
    setCookie('ai_chat_settings', JSON.stringify(settings), 365);
}

// Adjust color brightness
function adjustColorBrightness(hex, percent) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    const lightenR = Math.min(r + Math.floor(percent / 100 * 255), 255);
    const lightenG = Math.min(g + Math.floor(percent / 100 * 255), 255);
    const lightenB = Math.min(b + Math.floor(percent / 100 * 255), 255);
    
    const rr = lightenR.toString(16).padStart(2, '0');
    const gg = lightenG.toString(16).padStart(2, '0');
    const bb = lightenB.toString(16).padStart(2, '0');
    
    return `#${rr}${gg}${bb}`;
}

// Send message to AI
async function sendMessage() {
    const inputEl = document.getElementById('ai-chat-input');
    const question = inputEl.value.trim();
    if (!question) return;
    
    // Reset textarea height
    inputEl.style.height = 'auto';
    
    // Display user message
    const userMessage = {
        type: 'user',
        content: question,
        timestamp: new Date().toISOString()
    };
    appendMessage(userMessage);
    saveMessage(userMessage);
    
    // Clear input
    inputEl.value = '';
    inputEl.disabled = true;
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Fetch AI response
        const response = await fetch(`${API_URL}${encodeURIComponent(question)}`);
        const data = await response.json();
        
        // Remove typing indicator
        hideTypingIndicator();
        
        if (data.ok) {
            const aiMessage = {
                type: 'ai',
                content: data.message,
                timestamp: new Date().toISOString()
            };
            appendMessage(aiMessage);
            saveMessage(aiMessage);
            
            // Text-to-speech for AI response if enabled
            if (window.speechSynthesis && getChatBehavior() === 'verbose') {
                speakText(data.message);
            }
        } else {
            const errorMessage = {
                type: 'ai',
                content: 'Не удалось получить ответ. Пожалуйста, попробуйте позже.',
                timestamp: new Date().toISOString()
            };
            appendMessage(errorMessage);
        }
    } catch (error) {
        console.error('Error fetching AI response:', error);
        hideTypingIndicator();
        
        const errorMessage = {
            type: 'ai',
            content: 'Ошибка соединения. Пожалуйста, проверьте подключение к интернету.',
            timestamp: new Date().toISOString()
        };
        appendMessage(errorMessage);
    } finally {
        inputEl.disabled = false;
        inputEl.focus();
    }
}

// Show typing indicator
function showTypingIndicator() {
    const messagesDiv = document.getElementById('ai-chat-messages');
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.id = 'typing-indicator';
    typingIndicator.innerHTML = `
        <div class="avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2a5 5 0 0 0-5 5v2a5 5 0 0 0 5 5 5 5 0 0 0 5-5V7a5 5 0 0 0-5-5z"/>
                <circle cx="9" cy="7" r="1"/>
                <circle cx="15" cy="7" r="1"/>
            </svg>
        </div>
        <div class="dots">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
        </div>
    `;
    messagesDiv.appendChild(typingIndicator);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Append message to chat
function appendMessage(message) {
    const messagesDiv = document.getElementById('ai-chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.type}`;
    
    const formattedContent = markdownToHtml(escapeHtml(message.content));
    const timestamp = new Date(message.timestamp).toLocaleTimeString();
    
    let avatarSvg;
    if (message.type === 'ai') {
        avatarSvg = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" stroke-opacity="0.7"/>
                <path d="M12 6v6l4 2" stroke-linecap="round"/>
                <circle cx="12" cy="12" r="2" fill="currentColor"/>
                <path d="M8 12h-4m20 0h-4" stroke-linecap="round"/>
                <path d="M12 4v-2m0 16v2" stroke-linecap="round"/>
            </svg>
        `;
    } else {
        avatarSvg = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="8"/>
                <path d="M12 14c-2 0-3.5 1-3.5 3v1h7v-1c0-2-1.5-3-3.5-3z"/>
                <circle cx="12" cy="8" r="3"/>
            </svg>
        `;
    }
    
    messageDiv.innerHTML = `
        <div class="avatar">
            ${avatarSvg}
        </div>
        <div class="message-content">
            ${formattedContent}
            <div class="message-timestamp">${timestamp}</div>
        </div>
        <div class="message-actions">
            <button class="copy-btn" aria-label="Копировать">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
            </button>
            <button class="share-btn" aria-label="Поделиться">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="18" cy="5" r="3"/>
                    <circle cx="6" cy="12" r="3"/>
                    <circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
            </button>
        </div>
    `;
    
    // Add event listeners to action buttons
    messageDiv.querySelector('.copy-btn').addEventListener('click', () => {
        copyToClipboard(message.content);
    });
    
    messageDiv.querySelector('.share-btn').addEventListener('click', () => {
        shareContent(message.content);
    });
    
    messagesDiv.appendChild(messageDiv);
    
    // Scroll to bottom with animation
    smoothScrollToBottom(messagesDiv);
}

// Smooth scroll to bottom
function smoothScrollToBottom(element) {
    const scrollHeight = element.scrollHeight;
    const duration = 300;
    const startingY = element.scrollTop;
    const diff = scrollHeight - startingY - element.clientHeight;
    
    let start;
    function step(timestamp) {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 0.5 - Math.cos(progress * Math.PI) / 2;
        
        element.scrollTop = startingY + diff * easeProgress;
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    }
    
    window.requestAnimationFrame(step);
}

// Save message to cookie storage
function saveMessage(message) {
    let history = getCookie(COOKIE_NAME);
    history = history ? JSON.parse(decodeURIComponent(history)) : [];
    
    // Limit history size
    if (history.length >= MAX_HISTORY_SIZE) {
        history = history.slice(-MAX_HISTORY_SIZE + 1);
    }
    
    history.push(message);
    setCookie(COOKIE_NAME, encodeURIComponent(JSON.stringify(history)), COOKIE_DAYS);
}

// Load chat history
function loadChatHistory() {
    const history = getCookie(COOKIE_NAME);
    if (history) {
        try {
            const messages = JSON.parse(decodeURIComponent(history));
            messages.forEach(message => {
                appendMessage(message);
            });
        } catch (error) {
            console.error('Failed to parse chat history:', error);
            // Clear corrupted history
            setCookie(COOKIE_NAME, '', -1);
        }
    }
}

// Display welcome message
function displayWelcomeMessage() {
    const history = getCookie(COOKIE_NAME);
    if (!history || JSON.parse(decodeURIComponent(history)).length === 0) {
        const welcomeMessage = {
            type: 'ai',
            content: 'Привет! 👋 Я ваш ИИ-помощник с современным дизайном Windows 11. Чем я могу вам помочь сегодня?',
            timestamp: new Date().toISOString()
        };
        appendMessage(welcomeMessage);
        // Don't save welcome message to history
    }
}

// Clear chat history
function clearChat() {
    const confirmClear = confirm('Вы уверены, что хотите очистить всю историю чата?');
    if (confirmClear) {
        setCookie(COOKIE_NAME, '', -1);
        document.getElementById('ai-chat-messages').innerHTML = '';
        displayWelcomeMessage();
    }
}

// Export chat history
function exportChat() {
    const history = getCookie(COOKIE_NAME);
    if (!history) {
        alert('История чата пуста.');
        return;
    }
    
    try {
        const messages = JSON.parse(decodeURIComponent(history));
        let exportText = 'История чата с ИИ Помощником\n\n';
        
        messages.forEach(msg => {
            const sender = msg.type === 'user' ? 'Вы' : 'ИИ';
            const time = new Date(msg.timestamp).toLocaleString();
            exportText += `[${time}] ${sender}: ${msg.content}\n\n`;
        });
        
        const blob = new Blob([exportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat_history_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Failed to export chat history:', error);
        alert('Не удалось экспортировать историю чата.');
    }
}

// Copy text to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            showNotification('Текст скопирован в буфер обмена!');
        })
        .catch(err => {
            console.error('Failed to copy text:', err);
            showNotification('Не удалось скопировать текст.', 'error');
        });
}

// Share content
function shareContent(text) {
    if (navigator.share) {
        navigator.share({
            title: 'Диалог с ИИ Помощником',
            text: text
        })
        .catch(err => {
            console.error('Share failed:', err);
        });
    } else {
        copyToClipboard(text);
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `ai-notification ${type}`;
    notification.innerText = message;
    
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = type === 'success' ? 'rgba(0, 120, 212, 0.9)' : 'rgba(255, 77, 79, 0.9)';
    notification.style.color = 'white';
    notification.style.padding = '12px 24px';
    notification.style.borderRadius = '8px';
    notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    notification.style.zIndex = '10010';
    notification.style.backdropFilter = 'blur(10px)';
    notification.style.animation = 'fadeInUp 0.3s, fadeOut 0.3s 2.7s forwards';
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from { opacity: 0; transform: translate(-50%, 20px); }
            to { opacity: 1; transform: translate(-50%, 0); }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
        style.remove();
    }, 3000);
}

// Get chat behavior setting
function getChatBehavior() {
    const settingsCookie = getCookie('ai_chat_settings');
    if (settingsCookie) {
        const settings = JSON.parse(settingsCookie);
        return settings.chatBehavior || 'standard';
    }
    return 'standard';
}

// Voice input functionality
let isRecording = false;
let recognition = null;

function toggleVoiceInput() {
    const voiceBtn = document.getElementById('ai-chat-voice-btn');
    
    if (!isRecording) {
        // Check if browser supports Speech Recognition
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            showNotification('Ваш браузер не поддерживает голосовой ввод.', 'error');
            return;
        }
        
        // Create speech recognition object
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'ru-RU';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        
        // Start recording
        recognition.start();
        isRecording = true;
        voiceBtn.classList.add('recording');
        showNotification('Говорите...');
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            document.getElementById('ai-chat-input').value = transcript;
            stopVoiceRecording();
        };
        
        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            showNotification('Ошибка распознавания речи.', 'error');
            stopVoiceRecording();
        };
        
        recognition.onend = function() {
            stopVoiceRecording();
        };
    } else {
        stopVoiceRecording();
    }
}

function stopVoiceRecording() {
    if (recognition) {
        recognition.stop();
        recognition = null;
    }
    isRecording = false;
    document.getElementById('ai-chat-voice-btn').classList.remove('recording');
}
// Text-to-speech functionality
function speakText(text) {
    if (!window.speechSynthesis) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ru-RU';
    utterance.rate = 0.9; // Slightly slower than default
    
    // Get available voices
    const voices = window.speechSynthesis.getVoices();
    
    // Try to find a Russian voice
    const russianVoice = voices.find(voice => 
        voice.lang.includes('ru') || voice.name.includes('Russian')
    );
    
    if (russianVoice) {
        utterance.voice = russianVoice;
    }
    
    // Speak
    window.speechSynthesis.speak(utterance);
}

// Initialize chat
document.addEventListener('DOMContentLoaded', () => {
    // Make sure we have voices loaded
    if (window.speechSynthesis) {
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = () => {};
        }
    }
    
    // Load dependencies
    loadDependencies();
    
    // Initialize chat components
    injectStyles();
    createChatButton();
    createChatWindow();
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
});

function loadDependencies() {
    // Load Prism.js for syntax highlighting
    const prismScript = document.createElement('script');
    prismScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js';
    prismScript.async = true;
    document.head.appendChild(prismScript);

    const prismCss = document.createElement('link');
    prismCss.rel = 'stylesheet';
    prismCss.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css';
    document.head.appendChild(prismCss);

    // Load additional Prism languages (optional, for broader support)
    prismScript.onload = () => {
        const languages = ['javascript', 'css', 'html', 'python', 'java'];
        languages.forEach(lang => {
            const script = document.createElement('script');
            script.src = `https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-${lang}.min.js`;
            script.async = true;
            document.head.appendChild(script);
        });
    };
}

function handleResize() {
    const chatButton = document.querySelector('.ai-chat-btn');
    const chatWindow = document.querySelector('.ai-chat-window');
    
    if (window.innerWidth <= 768) {
        chatButton.classList.remove('desktop');
        chatButton.classList.add('mobile');
        chatWindow.classList.add('mobile');
    } else {
        chatButton.classList.remove('mobile');
        chatButton.classList.add('desktop');
        chatWindow.classList.remove('mobile');
    }
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function setCookie(name, value, days) {
    try {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = days ? `; expires=${date.toUTCString()}` : '';
        document.cookie = `${name}=${encodeURIComponent(value || '')}${expires}; path=/; SameSite=Strict`;
    } catch (error) {
        console.error('Failed to set cookie:', error);
        showNotification('Не удалось сохранить данные чата.', 'error');
    }
}

function getCookie(name) {
    try {
        const nameEQ = `${name}=`;
        return document.cookie.split(';')
            .map(c => c.trim())
            .find(c => c.startsWith(nameEQ))
            ?.substring(nameEQ.length) || null;
    } catch (error) {
        console.error('Failed to get cookie:', error);
        return null;
    }
}

function markdownToHtml(text) {
    // Handle code blocks
    text = text.replace(/```(.*?)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');

    // Handle blockquotes
    text = text.replace(/^> (.*)$/gm, '<blockquote>$1</blockquote>');

    // Handle headings (#, ##, ###)
    text = text.replace(/^### (.*)$/gm, '<h3>$1</h3>');
    text = text.replace(/^## (.*)$/gm, '<h2>$1</h2>');
    text = text.replace(/^# (.*)$/gm, '<h1>$1</h1>');

    // Handle unordered lists
    text = text.replace(/^\* (.*)$/gm, '<ul><li>$1</li></ul>');
    text = text.replace(/<\/ul>\n<ul>/g, ''); // Merge consecutive lists

    // Handle ordered lists
    text = text.replace(/^\d+\. (.*)$/gm, '<ol><li>$1</li></ol>');
    text = text.replace(/<\/ol>\n<ol>/g, '');

    // Handle inline formatting
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/$$   (.*?)   $$$$   (.*?)   $$/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/\n/g, '<br>');
}

function createChatButton() {
    const button = document.createElement('button');
    button.className = `ai-chat-btn ${window.innerWidth <= 768 ? 'mobile' : 'desktop'}`;
    button.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.7"/>
            <path d="M12 6v6l4 2" stroke-linecap="round"/>
            <circle cx="12" cy="12" r="2" fill="currentColor"/>
            <path d="M8 12h-4m20 0h-4" stroke-linecap="round"/>
            <path d="M12 4v-2m0 16v2" stroke-linecap="round"/>
        </svg>
        <span>${getText('assistantName')}</span>
    `;
    button.setAttribute('aria-label', 'Открыть чат с ИИ помощником');
    button.tabIndex = 0;
    button.addEventListener('click', toggleChatWindow);
    button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleChatWindow();
        }
    });
    document.body.appendChild(button);
}
