
import { GoogleGenAI, Type } from "@google/genai";
import { PerformanceData, CoachingReport, LeadershipPersona, AppLanguage } from '../types';
import { SYSTEM_INSTRUCTION, PERSONA_CONFIGS } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCoachingReport = async (
  data: PerformanceData, 
  persona: LeadershipPersona,
  language: AppLanguage
): Promise<CoachingReport> => {
  const model = 'gemini-3-pro-preview';
  
  const personaInstruction = PERSONA_CONFIGS[persona];
  const combinedSystemInstruction = `
    ${SYSTEM_INSTRUCTION}
    
    CURRENT ACTIVE PERSONA: ${persona}
    ${personaInstruction}
    
    CRITICAL RULES:
    1. DO NOT REPEAT THE INPUT DATA. The user already knows the numbers. Tell them what the numbers *mean* for the person's future.
    2. LANGUAGE: Use ${language}. Keep it conversational but professional. No jargon tags like "According to the SCARF model...". Just give the advice.
    3. REFERENCES: If you used specific research or models to formulate your advice, list them ONLY in the 'references' array.
    4. PROBLEM STATEMENT: Be bold. Tell the leader exactly what the "invisible" problem is.
  `;

  // Updated prompt to include behavioral sentiment data
  const prompt = `
    Colleague Name: ${data.employeeName}
    Strategic Role: ${data.role}
    Metrics: ${JSON.stringify(data.metrics)}
    Context/Observations: ${data.context || 'Regular performance cycle.'}
    Sentiment: ${data.sentiment} - ${data.sentimentNotes}

    As a ${persona}, provide a deep coaching assessment. 
    Focus on things the manager might have missed. 
    Output in ${language}.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: combinedSystemInstruction,
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallAssessment: { 
            type: Type.STRING,
            description: "A narrative deep-dive into the 'hidden problem' and how to fix it. Use plain language."
          },
          empathyNote: { type: Type.STRING, description: "A high-empathy 'leader-to-leader' perspective." },
          performanceGapAnalysis: { type: Type.STRING },
          // Added sentimentInsight to capture the emotional essence of the person
          sentimentInsight: { 
            type: Type.STRING, 
            description: "A punchy, insightful quote about the person's current headspace." 
          },
          coachingConversationStarters: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          actionPlan: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                task: { type: Type.STRING },
                deadline: { type: Type.STRING },
                supportNeeded: { type: Type.STRING }
              },
              required: ['task', 'deadline', 'supportNeeded']
            }
          },
          n8nPayload: { type: Type.STRING },
          learningSources: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          references: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Formal citations, model names (e.g. 'Radical Candor'), and research links used."
          }
        },
        required: ['overallAssessment', 'empathyNote', 'performanceGapAnalysis', 'sentimentInsight', 'coachingConversationStarters', 'actionPlan', 'n8nPayload', 'references']
      }
    }
  });

  try {
    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse AI response", e);
    throw new Error("Invalid response format from AI");
  }
};

export const chatWithLeader = async (
  history: {role: 'user' | 'model', text: string}[], 
  message: string, 
  persona: LeadershipPersona,
  language: AppLanguage
) => {
  const model = 'gemini-3-pro-preview';
  
  const personaInstruction = PERSONA_CONFIGS[persona];
  const combinedSystemInstruction = `
    ${SYSTEM_INSTRUCTION}
    ACTIVE PERSONA: ${persona}
    ${personaInstruction}
    LANGUAGE: Respond in ${language}. 
    Maintain the chosen persona's specific coaching style throughout.
  `;

  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction: combinedSystemInstruction,
      tools: [{ googleSearch: {} }]
    }
  });

  const response = await chat.sendMessage({ message });
  return response.text;
};
