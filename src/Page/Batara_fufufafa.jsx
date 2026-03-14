import React, { useState, useEffect, useRef } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Send, User, DownloadIcon } from "lucide-react";

const parseMarkdownCode = (text) => {
  const regex = /```(\w*)\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: "code", lang: match[1] || "bash", content: match[2] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", content: text.slice(lastIndex) });
  }

  return parts;
};
const Batara = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fullResponse, setFullResponse] = useState("");
  const [typingEffect, setTypingEffect] = useState("");

  const intervalRef = useRef(null);

  const handleSendMessage = async () => {
    if (inputText.trim()) {
      const userMessage = {
        id: messages.length + 1,
        text: inputText,
        sender: "user",
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputText("");
      setIsLoading(true);
      setTypingEffect("");

      try {
        const res = await fetch("http://localhost:3000/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: inputText }),
        });

        const data = await res.json();
        const responseText = data.response || "Terjadi kesalahan di server";

        let index = 0;
        let output = "";

        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
          if (index < responseText.length) {
            output += responseText[index];
            setTypingEffect(output);
            index++;
          } else {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setTypingEffect("");
            setMessages((prev) => [
              ...prev,
              {
                id: prev.length + 1,
                text: responseText,
                sender: "ai",
                timestamp: new Date().toLocaleTimeString(),
              },
            ]);
            setIsLoading(false);
          }
        }, 10);
      } catch (err) {
        console.error("Fetch error:", err);
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            text: "Gagal menghubungi server.",
            sender: "ai",
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
        setIsLoading(false);
        setTypingEffect("");
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }
  };

  useEffect(() => {
    if (!isLoading && typingEffect && typingEffect === fullResponse && fullResponse !== "") {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: fullResponse,
          sender: "ai",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      setFullResponse("");
      setTypingEffect("");
    }
  }, [isLoading, typingEffect, fullResponse]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  // const bottomRef = useRef(null);

  // const scrollToBottom = () => {
  //   // behavior: "smooth" membuat efek scroll mengalir, bukan loncat tiba-tiba
  //   bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  // };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-4 ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
              {message.sender === "ai" && (
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold">AI</span>
                </div>
              )}

              <div className={`max-w-3xl ${message.sender === "user" ? "order-first" : ""}`}>
                <div className={`p-4 rounded-lg ${message.sender === "user" ? "bg-blue-600 text-white ml-auto" : "bg-gray-800 text-gray-100"}`}>
                  {parseMarkdownCode(message.text).map((block, idx) =>
                    block.type === "code" ? (
                      <SyntaxHighlighter key={idx} language={block.lang} style={vscDarkPlus} customStyle={{ borderRadius: 8 }}>
                        {block.content.trim()}
                      </SyntaxHighlighter>
                    ) : (
                      <p key={idx} className="whitespace-pre-wrap">
                        {block.content}
                      </p>
                    ),
                  )}
                </div>
                <div className={`text-xs text-gray-500 mt-1 ${message.sender === "user" ? "text-right" : "text-left"}`}>{message.timestamp}</div>
              </div>

              {message.sender === "user" && (
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
                      block.type === "code" ? (
                        <SyntaxHighlighter key={idx} language={block.lang} style={vscDarkPlus} customStyle={{ borderRadius: 8 }}>
                          {block.content.trim()}
                        </SyntaxHighlighter>
                      ) : (
                        <span key={idx}>{block.content}</span>
                      ),
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
            {/* <div className="flex items-center justify-center mb-16">
              <button onClick={scrollToBottom}>Scroll ke Bawah</button>
            </div> */}
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything"
                className="w-full p-4 pr-12 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
                rows="1"
                style={{ minHeight: "60px" }}
              />
              <button
                title="kirim pesan"
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
            <div className="text-xs text-gray-500 text-center mt-2">Press Enter to send, Shift+Enter for new line</div>
          </div>
        </div>
      </div>

      {/* <div ref={bottomRef} /> */}
    </div>
  );
};

export default Batara;
