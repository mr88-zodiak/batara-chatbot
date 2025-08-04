import React, { useState, useEffect, useRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  Send,
  Plus,
  MessageSquare,
  Settings,
  User,
  Moon,
  Menu,
  X,
} from 'lucide-react';

const parseMarkdownCode = (text) => {
  const regex = /```(\w*)\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'code', lang: match[1] || 'bash', content: match[2] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return parts;
};

const Batara_fufufafa = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fullResponse, setFullResponse] = useState('');
  const [typingEffect, setTypingEffect] = useState('');
  const [chatHistory] = useState([
    { id: 1, title: 'React Best Practices', date: 'Today' },
    { id: 2, title: 'JavaScript Async/Await', date: 'Yesterday' },
    { id: 3, title: 'CSS Grid vs Flexbox', date: 'Yesterday' },
    { id: 4, title: 'Python Data Structures', date: '2 days ago' },
    { id: 5, title: 'Node.js Authentication', date: '3 days ago' },
  ]);

  const intervalRef = useRef(null); // <--- PENTING: Pindahkan ke sini!

  const handleSendMessage = async () => {
    if (inputText.trim()) {
      const userMessage = {
        id: messages.length + 1,
        text: inputText,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputText('');
      setIsLoading(true);
      setTypingEffect('');

      try {
        const res = await fetch(
          'http://127.0.0.1:5000/Batara_fufufafa/prompt',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: inputText }),
          }
        );

        const data = await res.json();
        const responseText = data.response || 'Terjadi kesalahan di server';

        let index = 0;
        let output = '';

        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
          if (index < responseText.length) {
            output += responseText[index];
            setTypingEffect(output);
            index++;
          } else {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setTypingEffect('');
            setMessages((prev) => [
              ...prev,
              {
                id: prev.length + 1,
                text: responseText,
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString(),
              },
            ]);
            setIsLoading(false);
          }
        }, 10);
      } catch (err) {
        console.error('Fetch error:', err);
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            text: 'Gagal menghubungi server.',
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
        setIsLoading(false);
        setTypingEffect('');
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }
  };

  useEffect(() => {
    if (
      !isLoading &&
      typingEffect &&
      typingEffect === fullResponse &&
      fullResponse !== ''
    ) {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: fullResponse,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      setFullResponse('');
      setTypingEffect('');
    }
  }, [isLoading, typingEffect, fullResponse]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <div
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-64 bg-gray-950 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        {/* Sidebar */}
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h1 className="text-lg font-semibold">Batara-fufufafa</h1>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-gray-800"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-4">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              <Plus size={18} />
              <span>New Chat</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4">
            <div className="space-y-2">
              {chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <MessageSquare size={16} className="text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {chat.title}
                    </div>
                    <div className="text-xs text-gray-500">{chat.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 border-t border-gray-800">
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded-lg transition-colors">
                <Settings size={18} />
                <span>Settings</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded-lg transition-colors">
                <User size={18} />
                <span>Account</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded-lg transition-colors">
                <Moon size={18} />
                <span>Dark Theme</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-800 lg:hidden">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-gray-800"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-semibold">Batara-fufufafa</h1>
          <div className="w-8"></div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.sender === 'ai' && (
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold">AI</span>
                </div>
              )}

              <div
                className={`max-w-3xl ${
                  message.sender === 'user' ? 'order-first' : ''
                }`}
              >
                <div
                  className={`p-4 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white ml-auto'
                      : 'bg-gray-800 text-gray-100'
                  }`}
                >
                  {parseMarkdownCode(message.text).map((block, idx) =>
                    block.type === 'code' ? (
                      <SyntaxHighlighter
                        key={idx}
                        language={block.lang}
                        style={vscDarkPlus}
                        customStyle={{ borderRadius: 8 }}
                      >
                        {block.content.trim()}
                      </SyntaxHighlighter>
                    ) : (
                      <p key={idx} className="whitespace-pre-wrap">
                        {block.content}
                      </p>
                    )
                  )}
                </div>
                <div
                  className={`text-xs text-gray-500 mt-1 ${
                    message.sender === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  {message.timestamp}
                </div>
              </div>

              {message.sender === 'user' && (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={16} />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold">AI</span>
              </div>
              <div className="max-w-3xl">
                <div className="p-4 rounded-lg bg-gray-800 text-gray-100">
                  <p className="whitespace-pre-wrap">
                    {parseMarkdownCode(typingEffect).map((block, idx) =>
                      block.type === 'code' ? (
                        <SyntaxHighlighter
                          key={idx}
                          language={block.lang}
                          style={vscDarkPlus}
                          customStyle={{ borderRadius: 8 }}
                        >
                          {block.content.trim()}
                        </SyntaxHighlighter>
                      ) : (
                        <span key={idx}>{block.content}</span>
                      )
                    )}
                  </p>
                  <div className="mt-2 animate-bounce text-xl">🇮🇩</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-800 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything"
                className="w-full p-4 pr-12 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
                rows="1"
                style={{ minHeight: '60px' }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
            <div className="text-xs text-gray-500 text-center mt-2">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </div>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Batara_fufufafa;
