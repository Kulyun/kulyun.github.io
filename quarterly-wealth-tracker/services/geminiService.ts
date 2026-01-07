
import { GoogleGenAI } from "@google/genai";
import { WealthRecord, GlobalMetrics } from "../types";

export const getFinancialAdvice = async (record: WealthRecord, metrics: GlobalMetrics): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyze this user's asset allocation for the current quarter and provide 3-4 professional financial insights.
    
    Data summary:
    - Total Assets: ${metrics.totalAssets}
    - Disposable Assets: ${metrics.disposableAssets}
    - Market Index Exposure (Pension + Index Funds): ${metrics.totalMarketIndex}
    
    Category breakdown (summarized):
    ${Object.entries(record.data).map(([key, entries]) => {
      const sum = entries.reduce((a, b) => a + b.value, 0);
      return `- ${key}: ${sum}`;
    }).join('\n')}

    Consider:
    1. Diversification (Bitcoin, Stocks, Bonds, Cash)
    2. Liquidity (Cash vs Real Estate)
    3. Long-term strategy (Index funds vs Individual stocks)
    
    Respond in a professional, encouraging tone. Keep it concise.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a professional wealth advisor. Analyze the provided portfolio and give concise advice in Chinese."
      }
    });
    return response.text || "Unable to generate advice at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI analysis unavailable. Please check your network connection.";
  }
};
