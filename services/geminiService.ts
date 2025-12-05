import { GoogleGenAI, Type } from "@google/genai";
import { Task, TaskType } from "../types";

const apiKey = process.env.API_KEY || ''; // Ensure this is set in your environment
const ai = new GoogleGenAI({ apiKey });

export const GeminiService = {
  /**
   * Generates a checklist of tasks based on the unit name/description.
   */
  generateTasksForUnit: async (unitDescription: string): Promise<Omit<Task, 'id' | 'isCompleted' | 'photoProofs'>[]> => {
    if (!apiKey) {
      console.warn("No API Key provided. Returning mock AI response.");
      return [
        { title: "Clean Main Area (Mock AI)", type: TaskType.CLEANING },
        { title: "Check Supplies (Mock AI)", type: TaskType.INVENTORY }
      ];
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Create a cleaning and inventory checklist for a rental unit described as: "${unitDescription}". 
        Return a list of 5-8 specific, actionable tasks. 
        Classify each as either 'CLEANING' or 'INVENTORY'.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Short actionable task title" },
                type: { type: Type.STRING, enum: ["CLEANING", "INVENTORY"] }
              },
              required: ["title", "type"]
            }
          }
        }
      });

      const data = JSON.parse(response.text || '[]');
      
      // Map string enum back to TypeScript enum
      return data.map((item: any) => ({
        title: item.title,
        type: item.type === 'INVENTORY' ? TaskType.INVENTORY : TaskType.CLEANING
      }));

    } catch (error) {
      console.error("Gemini AI Error:", error);
      return [];
    }
  }
};
