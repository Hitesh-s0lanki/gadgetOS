"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport, UIMessage } from "ai";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Send } from "lucide-react";

export default function ChatApp() {
  const storedMessages = useQuery(api.chat.getMessages);
  const addMessage = useMutation(api.chat.addMessage);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new TextStreamChatTransport({ api: "/api/chat" }),
    onFinish: async ({ message }: { message: UIMessage }) => {
      const textPart = message.parts.find((p) => p.type === "text");
      if (textPart && textPart.type === "text") {
        await addMessage({ role: "assistant", content: textPart.text });
      }
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Load persisted messages from Convex into useChat on first mount
  useEffect(() => {
    if (storedMessages && storedMessages.length > 0 && messages.length === 0) {
      setMessages(
        storedMessages.map((m) => ({
          id: m._id,
          role: m.role as UIMessage["role"],
          parts: [{ type: "text" as const, text: m.content }],
        }))
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedMessages]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput("");
    await addMessage({ role: "user", content: text });
    sendMessage({ text });
  };

  return (
    <div className="bg-white/60 backdrop-blur-2xl w-full h-full flex flex-col overflow-hidden">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm select-none">
            Ask me anything...
          </div>
        )}
        {messages.map((m) => {
          const textContent = m.parts
            .filter((p) => p.type === "text")
            .map((p) => (p.type === "text" ? p.text : ""))
            .join("");
          return (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                  m.role === "user"
                    ? "bg-indigo-500 text-white rounded-br-sm"
                    : "bg-white/80 text-gray-800 border border-white/50 rounded-bl-sm shadow-sm"
                }`}
              >
                {textContent}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/80 border border-white/50 rounded-2xl rounded-bl-sm px-4 py-2 shadow-sm">
              <span className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={onSubmit}
        className="border-t border-white/50 p-3 flex gap-2 bg-white/40 backdrop-blur-xl"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          placeholder="Type a message..."
          className="flex-1 bg-white/70 border border-white/50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white rounded-xl px-3 py-2 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
