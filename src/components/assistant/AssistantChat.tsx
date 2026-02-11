"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, Package, ChevronRight } from "lucide-react";
import { Product } from "@/app/actions";
import Image from "next/image";
import Link from "next/link";
import { RecommendationRequest, RecommendationResponse } from "@/types/assistant-types";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    products?: Product[];
    timestamp: Date;
}

export default function AssistantChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Load messages from local storage on mount
    useEffect(() => {
        const savedMessages = localStorage.getItem("assistant_chat_history");
        if (savedMessages) {
            try {
                const parsed = JSON.parse(savedMessages);
                // Simple validation to ensure it's an array
                if (Array.isArray(parsed)) {
                    // Re-hydrate Date objects
                    const hydratedMessages = parsed.map(msg => ({
                        ...msg,
                        timestamp: new Date(msg.timestamp)
                    }));
                    setMessages(hydratedMessages);
                }
            } catch (e) {
                console.error("Failed to parse chat history", e);
            }
        } else {
            // Initial greeting if no history
            setMessages([
                {
                    id: "welcome",
                    role: "assistant",
                    content: "Hi! I'm your Smart Shopping Assistant. I can help you find products or take requests for items we don't have yet. Try saying 'I need running shoes' or 'Request a new product'.",
                    timestamp: new Date(),
                },
            ]);
        }
    }, []);

    // Save messages to local storage whenever they change
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem("assistant_chat_history", JSON.stringify(messages));
        }
    }, [messages]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Listen for custom open event
    useEffect(() => {
        const handleOpenChat = () => setIsOpen(true);
        window.addEventListener("open-assistant-chat", handleOpenChat);
        return () => window.removeEventListener("open-assistant-chat", handleOpenChat);
    }, []);

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: inputValue.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue("");
        setIsLoading(true);

        try {
            // Get last 6 messages for context (excluding the current one we just added)
            const history = messages.slice(-6).map(m => ({
                role: m.role,
                content: m.content
            }));

            const reqBody: RecommendationRequest = {
                query: userMessage.content,
                messages: history,
                maxResults: 5
            };

            const response = await fetch("/api/assistant/recommend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(reqBody)
            });

            if (!response.ok) throw new Error("Failed to get recommendations");

            const data: RecommendationResponse = await response.json();

            // Format the summary - simple markdown bold parsing
            const formattedSummary = data.summary.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: formattedSummary,
                products: data.success ? data.recommendations.map(r => r.product) : [],
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);

        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "I'm sorry, I encountered an error while searching for products. Please try again later.",
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-brand-blue text-white rounded-full shadow-lg shadow-brand-blue/30 flex items-center justify-center border-2 border-white/20 backdrop-blur-md"
                    >
                        <Sparkles className="w-6 h-6 fill-current" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-brand-lime rounded-full border border-white animate-pulse" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-6 right-6 z-50 w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 bg-brand-dark text-white flex items-center justify-between shadow-md relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/20 to-brand-lime/20 mix-blend-overlay" />
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
                                    <Sparkles className="w-5 h-5 text-brand-lime" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Smart Assistant</h3>
                                    <p className="text-[10px] text-slate-300 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-brand-lime" />
                                        Powered by Groq AI
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors relative z-10"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scrollbar-thin scrollbar-thumb-slate-200">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                                >
                                    <div
                                        className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === "user"
                                            ? "bg-brand-blue text-white rounded-tr-none"
                                            : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                                            }`}
                                    >
                                        <div dangerouslySetInnerHTML={{ __html: msg.content }} />
                                    </div>

                                    {/* Product Cards for Assistant Response */}
                                    {msg.products && msg.products.length > 0 && (
                                        <div className="mt-3 w-full space-y-2">
                                            {msg.products.map(product => (
                                                <Link
                                                    key={product.id}
                                                    href={`/products/${product.id}`}
                                                    className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-100 hover:border-brand-blue/30 hover:shadow-md transition-all group"
                                                >
                                                    <div className="relative w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                                        {product.imageUrl ? (
                                                            <Image
                                                                src={product.imageUrl}
                                                                alt={product.name}
                                                                fill
                                                                className="object-cover"
                                                                sizes="64px"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Package className="w-6 h-6 text-slate-300" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-xs text-brand-dark truncate group-hover:text-brand-blue transition-colors">
                                                            {product.name}
                                                        </h4>
                                                        <p className="text-[10px] text-slate-500 line-clamp-1 mb-1">{product.description}</p>
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="font-bold text-sm text-brand-dark">₹{product.price.toLocaleString()}</span>
                                                            {product.originalPrice && (
                                                                <span className="text-[10px] text-slate-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="p-1.5 rounded-full bg-slate-50 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                                                        <ChevronRight className="w-4 h-4" />
                                                    </div>
                                                </Link>
                                            ))}
                                            <div className="text-center pt-1">
                                                <Link href="/products" className="text-xs font-semibold text-brand-blue hover:underline">
                                                    View all results
                                                </Link>
                                            </div>
                                        </div>
                                    )}

                                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </motion.div>
                            ))}

                            {/* Loading Indicator */}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-start"
                                >
                                    <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex gap-1">
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100">
                            <div className="relative flex items-center">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Ask for anything..."
                                    disabled={isLoading}
                                    className="w-full bg-slate-100 border-0 rounded-full py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-brand-blue/50 focus:bg-white transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isLoading}
                                    className="absolute right-1.5 p-2 bg-brand-blue text-white rounded-full disabled:opacity-50 disabled:bg-slate-300 transition-colors hover:bg-brand-dark"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
