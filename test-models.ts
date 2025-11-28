import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        // Note: listModels is not directly exposed on the instance in some versions, 
        // but let's try to see if we can just make a raw request or use the model to get metadata.
        // Actually, the error message suggested calling ListModels.
        // The SDK might not have a helper for it in the main class easily accessible in this version?
        // Let's try to just run a simple prompt with 'gemini-pro' again but with a different approach.
        // Or better, let's try to use the 'gemini-1.0-pro' which is definitely standard.
        console.log("Testing with gemini-1.0-pro...");
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello");
        console.log("Success:", result.response.text());
    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
