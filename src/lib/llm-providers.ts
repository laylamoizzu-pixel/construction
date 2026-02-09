import { LLMProvider, LLMServiceError } from "@/types/assistant-types";

// Provider interface
export interface LLMProviderInterface {
    id: LLMProvider;
    name: string;
    generateContent(prompt: string, apiKey: string): Promise<string>;
}

// ==================== GOOGLE GEMINI PROVIDER ====================

export class GeminiProvider implements LLMProviderInterface {
    id: LLMProvider = "google";
    name = "Google Gemini";
    private baseUrl = "https://generativelanguage.googleapis.com/v1beta/models";
    private model = "gemini-2.0-flash";

    async generateContent(prompt: string, apiKey: string): Promise<string> {
        const url = `${this.baseUrl}/${this.model}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: prompt }],
                    },
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048,
                },
            }),
        });

        if (response.status === 429) {
            throw new LLMServiceError("Rate limit exceeded", 429);
        }

        if (!response.ok) {
            throw new LLMServiceError(`API request failed: ${response.statusText}`, response.status);
        }

        const data = await response.json();

        if (data.error) {
            throw new LLMServiceError(data.error.message, data.error.code);
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
            throw new LLMServiceError("No response text from Gemini");
        }

        return text;
    }
}

// ==================== OPENAI PROVIDER ====================

export class OpenAIProvider implements LLMProviderInterface {
    id: LLMProvider = "openai";
    name = "OpenAI GPT-4o";
    private baseUrl = "https://api.openai.com/v1/chat/completions";
    private model = "gpt-4o"; // Or gpt-3.5-turbo if preferred

    async generateContent(prompt: string, apiKey: string): Promise<string> {
        const response = await fetch(this.baseUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: this.model,
                messages: [
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 2048,
            }),
        });

        if (response.status === 429) {
            throw new LLMServiceError("Rate limit exceeded", 429);
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new LLMServiceError(`API request failed: ${response.status} - ${errorText}`, response.status);
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;

        if (!text) {
            throw new LLMServiceError("No response text from OpenAI");
        }

        return text;
    }
}

// ==================== ANTHROPIC PROVIDER ====================

export class AnthropicProvider implements LLMProviderInterface {
    id: LLMProvider = "anthropic";
    name = "Anthropic Claude 3.5 Sonnet";
    private baseUrl = "https://api.anthropic.com/v1/messages";
    private model = "claude-3-5-sonnet-20240620";

    async generateContent(prompt: string, apiKey: string): Promise<string> {
        const response = await fetch(this.baseUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify({
                model: this.model,
                messages: [
                    { role: "user", content: prompt }
                ],
                max_tokens: 2048,
                temperature: 0.7,
            }),
        });

        if (response.status === 429) {
            throw new LLMServiceError("Rate limit exceeded", 429);
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new LLMServiceError(`API request failed: ${response.status} - ${errorText}`, response.status);
        }

        const data = await response.json();
        const text = data.content?.[0]?.text;

        if (!text) {
            throw new LLMServiceError("No response text from Anthropic");
        }

        return text;
    }
}

// ==================== GROQ PROVIDER ====================

export class GroqProvider implements LLMProviderInterface {
    id: LLMProvider = "groq";
    name = "Groq Llama 3";
    private baseUrl = "https://api.groq.com/openai/v1/chat/completions";
    private model = "llama-3.3-70b-versatile";

    async generateContent(prompt: string, apiKey: string): Promise<string> {
        const response = await fetch(this.baseUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: this.model,
                messages: [
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 2048,
            }),
        });

        if (response.status === 429) {
            throw new LLMServiceError("Rate limit exceeded", 429);
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new LLMServiceError(`API request failed: ${response.status} - ${errorText}`, response.status);
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;

        if (!text) {
            throw new LLMServiceError("No response text from Groq");
        }

        return text;
    }
}

//Factory to get provider
export function getProvider(id: LLMProvider): LLMProviderInterface {
    switch (id) {
        case "google":
            return new GeminiProvider();
        case "openai":
            return new OpenAIProvider();
        case "anthropic":
            return new AnthropicProvider();
        case "groq":
            return new GroqProvider();
        default:
            throw new Error(`Unknown provider: ${id}`);
    }
}
