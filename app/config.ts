import { OpenAI } from 'langchain/llms/openai';

export const llm = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  streaming: true,
  temperature: 0
} as any);
