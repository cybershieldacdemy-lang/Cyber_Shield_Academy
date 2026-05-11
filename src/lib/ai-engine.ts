import "server-only";
import { getLlama, LlamaChatSession, LlamaModel, LlamaContext } from "node-llama-cpp";

const MODEL_PATH = "d:/new/cyber-chell/ai agent/DeepSeek-R1-Distill-Qwen-1.5B-Q4_0.gguf";

const globalForLlama = global as unknown as {
    llamaPromise?: Promise<any>;
};

async function initLlama() {
    if (!globalForLlama.llamaPromise) {
        globalForLlama.llamaPromise = (async () => {
            console.log("Loading local AI model from", MODEL_PATH);
            try {
                const llama = await getLlama();
                const model = await llama.loadModel({ modelPath: MODEL_PATH });
                const context = await model.createContext();
                console.log("Local AI model loaded successfully.");
                return { llama, model, context };
            } catch (err) {
                console.error("Failed to load local model:", err);
                throw err;
            }
        })();
    }
    return globalForLlama.llamaPromise;
}

export interface AIMessage {
    role: 'user' | 'model';
    content: string;
}

export interface AIContext {
    type: 'general' | 'lesson' | 'lab' | 'ctf' | 'attack-map';
    id?: string;
    title?: string;
    description?: string;
    difficulty?: string;
    extra?: string;
}

export async function chat(
    message: string,
    history: AIMessage[],
    level: string = 'beginner',
    contextInfo: AIContext = { type: 'general' }
): Promise<{ response: string; tokensUsed: number }> {
    try {
        const { context } = await initLlama();
        
        const sequence = context.getSequence();
        const session = new LlamaChatSession({
            contextSequence: sequence,
            systemPrompt: "أنت درع، مساعد أمن سيبراني ذكي ومتخصص من أكاديمية الدرع السيبراني. أجب باللغة العربية بوضوح واحترافية وبشكل مختصر ومفيد، واستخدم التنسيقات (Markdown) إذا لزم الأمر."
        });
        
        console.log("Generating response for:", message);
        const res = await session.prompt(message);
        console.log("Response generated successfully.");
        
        return { response: res, tokensUsed: 0 };
    } catch (error: any) {
        console.error("Local AI engine error:", error);
        throw new Error(JSON.stringify({ type: 'SERVER_ERROR', message: "تعذر توليد الرد من النموذج المحلي. الرجاء التحقق من الخادم." }));
    }
}

export function isConfigured(): boolean {
    return true; // Local model is assumed to be always configured
}

export async function generateQuiz(topic: string, difficulty: string = 'beginner', count: number = 5, language: string = 'ar') {
    // Stub for now
    return { questions: [], tokensUsed: 0 };
}

export async function generateSuggestions(userProgress: any) {
    // Stub for now
    return { suggestions: "", tokensUsed: 0 };
}
