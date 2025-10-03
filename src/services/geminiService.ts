import { GoogleGenAI, Type } from "@google/genai";
import { Question } from '@/types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Improved check for the API key
if (!GEMINI_API_KEY || GEMINI_API_KEY === 'undefined') {
    // This error will be caught by the components to inform the user.
    throw new Error("GEMINI_API_KEY_MISSING");
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const generateSummaryFromText = async (text: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Por favor, gere um resumo claro e organizado do seguinte texto, focado nos pontos principais para um estudante de odontologia:\n\n---\n\n${text}`,
            config: {
                temperature: 0.5,
                topP: 0.95,
                topK: 64,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error generating summary:", error);
        // Re-throw the error to be handled by the calling component
        throw new Error("Falha ao gerar resumo. Verifique o console para mais detalhes.");
    }
};

export const generateQuestionsFromText = async (text: string): Promise<Question[]> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Com base no texto a seguir, crie 5 questões de múltipla escolha para um estudante de odontologia. Cada questão deve ter 4 opções e uma resposta correta. Formate a saída exatamente como o schema JSON fornecido.\n\n---\n\n${text}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            options: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            },
                            correctAnswer: { type: Type.STRING }
                        },
                        required: ["question", "options", "correctAnswer"]
                    },
                },
            },
        });

        const jsonString = response.text;
        const parsedQuestions = JSON.parse(jsonString);

        return parsedQuestions.map((q: any, index: number) => ({
            ...q,
            id: `q-${Date.now()}-${index}`,
            type: 'multiple-choice'
        })) as Question[];

    } catch (error) {
        console.error("Error generating questions:", error);
        // Re-throw the error to be handled by the calling component
        throw new Error("Falha ao gerar questões. Verifique o console para mais detalhes.");
    }
};

export const generateChatResponse = async (question: string, documentsContent: string): Promise<string> => {
    try {
        const prompt = `Você é um assistente de estudos especializado em odontologia. Sua tarefa é responder à pergunta do usuário baseando-se exclusivamente no contexto dos documentos de estudo fornecidos. Não utilize conhecimento externo. Se a resposta não estiver contida nos documentos, informe claramente que não encontrou a informação nos materiais fornecidos.

--- CONTEXTO DOS DOCUMENTOS ---
${documentsContent}
--- FIM DO CONTEXTO ---

PERGUNTA DO USUÁRIO: "${question}"

Sua Resposta:`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.3,
                topP: 0.95,
                topK: 64,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error generating chat response:", error);
        throw new Error("Falha ao gerar resposta do chat. Verifique o console para mais detalhes.");
    }
};