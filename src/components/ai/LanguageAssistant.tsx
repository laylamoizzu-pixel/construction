"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Loader2, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { sendChatMessage, ChatMessage } from "@/app/actions/language-assistant-action";

export default function LanguageAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: "assistant", content: "Namaste! 🙏 I'm Genie. I can help you shop in English, Hindi, or Hinglish. What are you looking for today?" }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [suggestedActions, setSuggestedActions] = useState<string[]>(["Best sellers?", "Men's Kurta under ₹2000", "Gift ideas for sister"]);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (text: string) => {
        if (!text.trim()) return;

        const userMsg: ChatMessage = { role: "user", content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        const response = await sendChatMessage(text, [...messages, userMsg]);

        if (response.success && response.reply) {
            setMessages(prev => [...prev, { role: "assistant", content: response.reply! }]);
            if (response.suggestedActions) {
                setSuggestedActions(response.suggestedActions);
            }
        } else {
            setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting. Please try again later." }]);
        }

        setIsLoading(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="pointer-events-auto w-[90vw] md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col h-[500px]"
                    >
                        {/* Header */}
                        <div className="bg-slate-900 p-4 flex items-center justify-between text-white shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/10 rounded-full">
                                    <Sparkles className="w-5 h-5 text-yellow-300" />
                                </div>
                                <div>
                                    <h3 className="font-bold">Genie Assistant</h3>
                                    <p className="text-xs text-slate-300 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                        Online • Multilingual
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scrollbar-thin scrollbar-thumb-slate-200">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === "user"
                                                ? "bg-brand-blue text-white rounded-br-none"
                                                : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <motion.div className="flex justify-start">
                                    <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-brand-blue" />
                                        <span className="text-xs text-slate-400">Thinking...</span>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggested Actions */}
                        {suggestedActions.length > 0 && !isLoading && (
                            <div className="px-4 py-2 bg-slate-50 flex gap-2 overflow-x-auto scrollbar-none border-t border-slate-100">
                                {suggestedActions.map((action, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSend(action)}
                                        className="whitespace-nowrap px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:bg-brand-blue/5 hover:text-brand-blue hover:border-brand-blue/30 transition-colors shadow-sm"
                                    >
                                        {action}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-3 bg-white border-t border-slate-100">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSend(input);
                                }}
                                className="flex gap-2"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type in Hindi or English..."
                                    className="flex-1 px-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:bg-white transition-all"
                                    disabled={isLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="p-2 bg-brand-blue text-white rounded-full hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-brand-blue/20 shadow-lg"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Trigger Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="pointer-events-auto bg-slate-900 text-white p-4 rounded-full shadow-2xl shadow-slate-900/40 flex items-center gap-2 group hover:ring-4 hover:ring-brand-blue/20 transition-all"
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6 text-brand-blue" />}
                {!isOpen && <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap px-0 group-hover:px-2 font-medium">Ask Genie</span>}
            </motion.button>
        </div>
    );
}
