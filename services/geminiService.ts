import { GoogleGenAI, Type } from "@google/genai";
import { Task, User, NotificationDraft } from "../types";

const apiKey = process.env.API_KEY || '';

// Safely initialize AI only if key is present to prevent runtime crash on load, 
// though actual calls will fail if key is missing.
const ai = new GoogleGenAI({ apiKey });

export const generateSubtasks = async (taskTitle: string, taskDescription: string): Promise<{ title: string }[]> => {
  try {
    const model = 'gemini-3-flash-preview';
    const prompt = `Break down the following project task into 3-5 concrete, actionable subtasks.
    Task Title: ${taskTitle}
    Task Description: ${taskDescription}`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "A concise subtask title" }
            },
            required: ["title"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to generate subtasks:", error);
    return [];
  }
};

export const draftNotificationEmail = async (task: Task, assignee: User, sender: User): Promise<NotificationDraft> => {
  try {
    const model = 'gemini-3-flash-preview';
    const prompt = `Write a professional and concise email notification from ${sender.name} to ${assignee.name} regarding a project task update.
    
    Task Details:
    - Title: ${task.title}
    - Status: ${task.status}
    - Priority: ${task.priority}
    - Due Date: ${task.dueDate || 'No due date'}
    
    The email should inform them of the current status or assignment and request any necessary action. Keep it under 100 words.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING, description: "Email subject line" },
            body: { type: Type.STRING, description: "Email body text" }
          },
          required: ["subject", "body"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to draft email:", error);
    return {
      subject: `Update regarding task: ${task.title}`,
      body: `Hi ${assignee.name},\n\nJust wanted to give you a quick update on "${task.title}". It is currently ${task.status}. Please check the board for details.\n\nBest,\n${sender.name}`
    };
  }
};
