import { GoogleGenAI, Type } from "@google/genai";
import { Question, Source } from '@/types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY || GEMINI_API_KEY === 'undefined') {
    throw new Error("GEMINI_API_KEY_MISSING");
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export interface ChatResponseWithCitations {
  answer: string;
  sources: Source[];
}

export const generateSummaryFromText = async (text: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Por favor, gere um resumo claro e organizado do seguinte texto, focado nos pontos principais para um estudante de odontologia:\n\n---\n\n${text}`,
            config: { temperature: 0.5, topP: 0.95, topK: 64 },
        });
        return response.text;
    } catch (error) {
        console.error("Error generating summary:", error);
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
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            correctAnswer: { type: Type.STRING }
                        },
                        required: ["question", "options", "correctAnswer"]
                    },
                },
            },
        });
        const parsedQuestions = JSON.parse(response.text);
        return parsedQuestions.map((q: any, index: number) => ({
            ...q, id: `q-${Date.now()}-${index}`, type: 'multiple-choice'
        })) as Question[];
    } catch (error) {
        console.error("Error generating questions:", error);
        throw new Error("Falha ao gerar questões. Verifique o console para mais detalhes.");
    }
};

export const generateChatResponse = async (question: string, documents: { name: string, content: string }[]): Promise<ChatResponseWithCitations> => {
    try {
        const documentsContext = documents.map((doc, index) => `--- Documento ${index + 1}: ${doc.name} ---\n${doc.content}`).join('\n\n');
        const prompt = `Você é um assistente de estudos de odontologia. Responda à pergunta do usuário baseando-se exclusivamente no contexto fornecido.
INSTRUÇÕES:
1. Formule uma resposta precisa. Na sua resposta, adicione citações no formato [fonte: N] onde N é o número do documento.
2. Após a resposta, forneça uma lista de "fontes" com o trecho exato do documento que suporta sua resposta.
3. Se a resposta não estiver nos documentos, o campo "answer" deve dizer isso e o campo "sources" deve ser um array vazio.
4. Sua saída DEVE ser um objeto JSON que corresponda ao schema fornecido.

--- CONTEXTO DOS DOCUMENTOS ---
${documentsContext}
--- FIM DO CONTEXTO ---

PERGUNTA DO USUÁRIO: "${question}"`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        answer: { type: Type.STRING },
                        sources: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.NUMBER },
                                    quote: { type: Type.STRING }
                                },
                                required: ["id", "quote"]
                            }
                        }
                    },
                    required: ["answer", "sources"]
                },
            },
        });

        const parsedResponse = JSON.parse(response.text);
        const sourcesWithNames = parsedResponse.sources.map((source: { id: number, quote: string }) => {
            const docIndex = source.id - 1;
            return {
                ...source,
                documentName: documents[docIndex] ? documents[docIndex].name : 'Fonte desconhecida'
            };
        });

        return { answer: parsedResponse.answer, sources: sourcesWithNames };
    } catch (error) {
        console.error("Error generating chat response:", error);
        throw new Error("Falha ao gerar resposta do chat. Verifique o console para mais detalhes.");
    }
};