import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { SYSTEM_PROMPT } from "@/lib/systemPrompt";

// Lazy Groq client - initialized on first request
let groq: Groq | null = null;

function getGroqClient(): Groq {
    if (!groq) {
        groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });
    }
    return groq;
}

// Type for request body
interface ChatRequest {
    message: string;
}

/**
 * POST /api/chat
 * 
 * Receives a user message (transcribed from speech) and returns
 * an AI-generated response that mimics the interview candidate.
 * Uses Groq's ultra-fast LLM inference.
 */
export async function POST(request: Request) {
    try {
        // Parse request body
        const body: ChatRequest = await request.json();
        const { message } = body;

        // Validate input
        if (!message || typeof message !== "string" || message.trim() === "") {
            return NextResponse.json(
                { error: "Please provide a valid message." },
                { status: 400 }
            );
        }

        // Check for API key
        if (!process.env.GROQ_API_KEY) {
            console.error("GROQ_API_KEY is not configured");
            return NextResponse.json(
                { error: "API configuration error. Please contact the administrator." },
                { status: 500 }
            );
        }

        // Call Groq API (using Llama 3.1 - fast and capable)
        const client = getGroqClient();
        const completion = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile", // Fast and high quality
            messages: [
                {
                    role: "system",
                    content: SYSTEM_PROMPT,
                },
                {
                    role: "user",
                    content: message.trim(),
                },
            ],
            max_tokens: 300, // Keep responses concise for voice
            temperature: 0.7, // Balance between creativity and consistency
        });

        // Extract response text
        const responseText = completion.choices[0]?.message?.content;

        if (!responseText) {
            throw new Error("No response generated");
        }

        // Return the response
        return NextResponse.json({
            response: responseText,
            usage: completion.usage,
        });

    } catch (error) {
        console.error("Chat API Error:", error);

        // Handle specific errors
        if (error instanceof Error) {
            if (error.message.includes("401") || error.message.includes("Unauthorized")) {
                return NextResponse.json(
                    { error: "Invalid API key. Please check your configuration." },
                    { status: 401 }
                );
            }
            if (error.message.includes("429") || error.message.includes("rate")) {
                return NextResponse.json(
                    { error: "Too many requests. Please wait a moment and try again." },
                    { status: 429 }
                );
            }
        }

        // Generic error response
        return NextResponse.json(
            { error: "Failed to generate response. Please try again." },
            { status: 500 }
        );
    }
}

// Handle unsupported methods
export async function GET() {
    return NextResponse.json(
        { error: "Method not allowed. Use POST." },
        { status: 405 }
    );
}
