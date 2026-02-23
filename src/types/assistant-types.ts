// Types for AI Product Recommendation Assistant

import { Product } from "@/app/actions";

// ==================== API KEY MANAGEMENT ====================

export type LLMProvider = "google" | "openai" | "anthropic" | "groq";

export interface APIKeyConfig {
    key: string;
    id?: string; // Optional Firestore ID or env identifier
    provider: LLMProvider;
    index: number;
    callCount: number;
    lastUsed: Date | null;
    errorCount: number;
    consecutiveErrors: number;
    rateLimited: boolean;
    cooldownUntil: Date | null;
}

export interface KeyHealthStatus {
    index: number;
    id?: string;
    provider: LLMProvider;
    maskedKey: string;
    callCount: number;
    isActive: boolean;
    isHealthy: boolean;
    rateLimited: boolean;
    cooldownRemaining: number | null; // seconds
}

export interface APIKeyManagerStatus {
    totalKeys: number;
    activeKeyIndex: number;
    keys: KeyHealthStatus[];
    lastRotation: Date | null;
}

// ==================== INTENT ANALYSIS ====================

export interface IntentAnalysis {
    category: string | null;
    subcategory: string | null;
    requirements: string[];
    budget: {
        min: number | null;
        max: number | null;
    };
    preferences: string[];
    useCase: string;
    confidence: number; // 0-1
    isGeneralChat?: boolean;
}

// ==================== PRODUCT MATCHING ====================

export interface ProductMatch {
    product: Product;
    matchScore: number; // 0-100
    highlights: string[];
    whyRecommended: string;
}

// ==================== RECOMMENDATION REQUEST/RESPONSE ====================

export interface RecommendationRequest {
    query: string;
    context?: {
        budget?: number;
        categoryId?: string;
        preferences?: string[];
        excludeProductIds?: string[];
    };
    messages?: Array<{ role: "user" | "assistant"; content: string }>; // Conversation history
    maxResults?: number;
}

export interface RecommendationResponse {
    success: boolean;
    error?: string;
    intent?: IntentAnalysis;
    recommendations: ProductMatch[];
    summary: string;
    processingTime: number; // ms
}

// ==================== LLM SERVICE ====================

export interface LLMIntentResponse {
    category: string | null;
    subcategory: string | null;
    requirements: string[];
    budgetMin: number | null;
    budgetMax: number | null;
    preferences: string[];
    useCase: string;
    confidence: number;
    productRequestData?: {
        name: string;
        category?: string;
        maxBudget?: number;
        specifications?: string[];
    } | null;
    isGeneralChat?: boolean;
}

export interface LLMRecommendationResponse {
    productId: string;
    matchScore: number;
    highlights: string[];
    whyRecommended: string;
}

export interface LLMSummaryResponse {
    summary: string;
}

// ==================== ERROR TYPES ====================

export class APIKeyExhaustedError extends Error {
    constructor(message: string = "All API keys are exhausted or rate-limited") {
        super(message);
        this.name = "APIKeyExhaustedError";
    }
}

export class LLMServiceError extends Error {
    public statusCode?: number;
    public isRateLimited: boolean;

    constructor(message: string, statusCode?: number) {
        super(message);
        this.name = "LLMServiceError";
        this.statusCode = statusCode;
        this.isRateLimited = statusCode === 429;
    }
}
