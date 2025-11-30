
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AssessmentResult } from '../types';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert blob to base64
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Response Schema for Risk Assessment
const riskAssessmentSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    scores: {
      type: Type.OBJECT,
      properties: {
        semantic: { type: Type.NUMBER, description: "Score 0-40: Overlap in subject, meaning, and narrative." },
        structure: { type: Type.NUMBER, description: "Score 0-40: Overlap in composition, color, lighting, and style." },
        compliance: { type: Type.NUMBER, description: "Score 0-20: Likelihood of direct copy/derivative work." },
        total: { type: Type.NUMBER, description: "Total Score 0-100." }
      },
      required: ["semantic", "structure", "compliance", "total"]
    },
    evidence: {
      type: Type.OBJECT,
      properties: {
        similarities: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of 3-5 specific visual elements that are suspiciously similar."
        },
        differences: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of visual elements that are distinct."
        }
      },
      required: ["similarities", "differences"]
    },
    analysisText: {
      type: Type.STRING,
      description: "Professional forensic summary in Chinese explaining the risk level."
    },
    breakdown: {
      type: Type.OBJECT,
      properties: {
        style: { 
          type: Type.OBJECT, 
          properties: { score: { type: Type.NUMBER }, comment: { type: Type.STRING } },
          required: ["score", "comment"]
        },
        composition: { 
          type: Type.OBJECT, 
          properties: { score: { type: Type.NUMBER }, comment: { type: Type.STRING } },
          required: ["score", "comment"]
        },
        elements: { 
          type: Type.OBJECT, 
          properties: { score: { type: Type.NUMBER }, comment: { type: Type.STRING } },
          required: ["score", "comment"]
        },
        font: { 
          type: Type.OBJECT, 
          properties: { score: { type: Type.NUMBER }, comment: { type: Type.STRING } },
          required: ["score", "comment"]
        }
      },
      required: ["style", "composition", "elements", "font"]
    },
    modificationSuggestion: {
      type: Type.STRING,
      description: "Actionable advice to reduce similarity. Null if risk is low."
    }
  },
  required: ["scores", "evidence", "analysisText", "breakdown"]
};

/**
 * Compares a target image against a reference image using Gemini 2.5 Flash.
 */
export async function analyzeImageRisk(
  targetImageBase64: string,
  targetMimeType: string,
  referenceImageBase64: string,
  referenceMimeType: string,
  referenceId: string,
  isPHashMatch: boolean = false
): Promise<AssessmentResult> {
  try {
    const prompt = `
      角色：你是一位极其严苛的【AIGC版权法务鉴定专家】。
      任务：对比【图片A（待测图）】与【图片B（样本库原图）】，分析侵权风险。

      前置校验：
      系统底层像素哈希（pHash）匹配结果：${isPHashMatch ? "**【匹配】(距离<=5，极大概率为同一图或微改图)**" : "【未匹配】(无直接像素复制)"}

      *** 评分标准（必须严格执行） ***
      
      1. **若 pHash 为【匹配】**：
         - 这是物理层面的“实锤”。
         - 此时请忽略细微的压缩噪点或色差。
         - **Total Score 必须 >= 90分**。
         - Structure与Semantic必须满分。
         - 必须在 analysisText 中明确指出“检测到像素级复制或极高相似度”。

      2. **若 pHash 为【未匹配】**，请进行深度视觉取证：
         - 只有当两者在“构图+主体+风格”三者高度统一时，才给高分（>60）。
         - 如果只是风格相似（如都是二次元）但内容不同，给低分（<30）。
         - 如果只是内容相似（如都有一只猫）但构图/画风完全不同，给中低分（30-50）。

      *** 维度定义 (Total 100) ***
      I.  核心语义 (Semantic, Max 40):
          - 画面叙事是否一致？核心物体/人物的特征是否雷同？
      II. 视觉结构 (Structure, Max 40):
          - 骨架重合度：构图视角、物体位置关系、光影方向。
          - 风格渲染：笔触、配色方案、材质感。
      III. 合规意图 (Compliance, Max 20):
          - 是否存在明显的“图生图(img2img)”痕迹？细节是否被挪用？

      请输出 JSON 报告。Evidence 数组必须包含具体的视觉证据（例如：“两张图中的人物姿势完全重叠”、“背景左上角都有一个红色的气球”）。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: targetMimeType, data: targetImageBase64 } }, // Target
          { inlineData: { mimeType: referenceMimeType, data: referenceImageBase64 } } // Reference
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: riskAssessmentSchema,
        temperature: 0.2 // Lower temperature for more analytical/consistent results
      }
    });

    const result = JSON.parse(response.text || '{}');

    return {
      referenceImageId: referenceId,
      isMatch: (result.scores?.total || 0) > 0,
      scores: result.scores || { semantic: 0, structure: 0, compliance: 0, total: 0 },
      analysisText: result.analysisText || "分析完成",
      evidence: result.evidence || { similarities: [], differences: [] },
      breakdown: result.breakdown || {
        style: { score: 0, comment: "无" },
        composition: { score: 0, comment: "无" },
        elements: { score: 0, comment: "无" },
        font: { score: 0, comment: "无" }
      },
      modificationSuggestion: result.modificationSuggestion,
      pHashMatch: isPHashMatch
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      referenceImageId: referenceId,
      isMatch: false,
      scores: { semantic: 0, structure: 0, compliance: 0, total: 0 },
      analysisText: "分析服务发生错误，请重试。",
      evidence: { similarities: [], differences: [] },
      breakdown: {
        style: { score: 0, comment: "" },
        composition: { score: 0, comment: "" },
        elements: { score: 0, comment: "" },
        font: { score: 0, comment: "" }
      },
      modificationSuggestion: null,
      pHashMatch: isPHashMatch
    };
  }
}

/**
 * Generates a visual description for indexing.
 * optimized for search keywords.
 */
export async function generateImageDescription(base64: string, mimeType: string): Promise<string> {
    try {
        const prompt = "Generate a dense list of visual keywords and a 1-sentence summary for this image. Include: Subject, Main Colors, Art Style, Composition, Key Objects. Do not use filler words. Format: 'Subject: ... | Style: ... | Keywords: ...'";
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType, data: base64 } }
                ]
            }
        });
        return response.text || "";
    } catch (e) {
        console.error("Description generation failed", e);
        return "";
    }
}

/**
 * Generates vector embedding for text.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        const result = await ai.models.embedContent({
            model: 'text-embedding-004',
            contents: { parts: [{ text }] }
        });
        return result.embedding?.values || [];
    } catch (e) {
        console.error("Embedding failed", e);
        return [];
    }
}

/**
 * Calculates Cosine Similarity between two vectors.
 */
export function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Generates a new image prompt based on the suggestion to avoid copyright.
 * NOW IN CHINESE.
 */
export async function refinePrompt(originalSuggestion: string): Promise<string> {
    const prompt = `
      任务：基于以下“版权风险规避建议”，编写一段**中文提示词（Prompt）**。
      目标用户：使用“即梦AI (Jimeng AI)”、“Midjourney”等工具的中文用户。
      
      规避建议：${originalSuggestion}
      
      要求：
      1. **必须输出中文**。
      2. 格式清晰，包含【主体】、【环境】、【风格】、【构图】等标签。
      3. 确保新的提示词能生成高质量图片，同时有效规避原图的版权风险（例如改变构图视角、光影、配色）。
      4. 直接输出提示词内容，不要有多余的寒暄。
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text || "";
}
