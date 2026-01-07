
import { GoogleGenAI } from "@google/genai";
import { WealthRecord, GlobalMetrics } from "../types";

export const getFinancialAdvice = async (record: WealthRecord, metrics: GlobalMetrics): Promise<string> => {
  // 安全地检查环境变量，防止浏览器报错
  const apiKey = typeof process !== 'undefined' ? process.env?.API_KEY : null;

  if (!apiKey) {
    return "💡 您尚未配置 API Key。如果您需要 AI 理财建议，请在部署平台（如 Vercel）的环境变量中设置 API_KEY。";
  }

  const ai = new GoogleGenAI({ apiKey });
  
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
    return response.text || "目前无法生成建议。";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI 分析暂时不可用，请检查 API 配置。";
  }
};
