# AI Product Request System

## Overview
The Smart Avenue AI Assistant includes a "Smart Product Request" feature that detects when a user is looking for an out-of-stock item and automatically facilitates a request for it.

## How It Works

### 1. Intent Detection with Context
The system analyzes the user's query **along with the last 6 messages of conversation history**. This allows it to understand context, such as:
*   User: "Do you have any flying cars?"
*   AI: "No, what's your budget?"
*   User: "Unlimited." -> **System detects valid request for 'Flying Car' with budget 'Unlimited'.**

### 2. Information Collection (Slot Filling)
If a user asks for a missing product but provides insufficient details, the AI is instructed to **ask purely conversational questions** first.
*   **Missing Details**: "We don't have that. What is your budget or preferred brand?"
*   **Sufficient Details**: Product Name + (Budget OR Specifications OR Brand).

### 3. Automatic Submission
Once the AI determines it has enough information (Name + at least one detail), it **automatically triggers** the `createProductRequest` server action.
*   No "confirmation" step is required ("Shall I send this?").
*   The AI simply confirms the action took place: "I've noted your request for [Product]..."

## Architecture

### frontend
*   **`components/assistant/AssistantChat.tsx`**: Manages chat state and sends the `messages` history array to the API.

### Backend
*   **`lib/llm-service.ts`**:
    *   `analyzeIntent`: Expanded to accept `messages` history.
    *   `handleMissingProduct`: specialized function that decides whether to `ask_details` or `request` based on conversation history.
*   **`lib/recommendation-engine.ts`**: Orchestrates the flow. If `analyzeIntent` or search results indicate a missing product, it calls `handleMissingProduct`.
*   **`app/actions/product-requests.ts`**: Server action to save requests to Firestore.

## Data Model (Firestore: `product_requests`)
```typescript
interface ProductRequest {
    productName: string;      // "Rolex Submariner"
    category?: string;        // "Watches"
    maxBudget?: number;       // 500000
    specifications?: string[]; // ["Blue dial", "Steel"]
    status: "pending";
    createdAt: Timestamp;
}
```
