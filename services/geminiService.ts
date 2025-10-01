import { GoogleGenAI, Type } from "@google/genai";
import { Question } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
        return "Desculpe, não foi possível gerar o resumo. Tente novamente.";
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
        return [];
    }
};
