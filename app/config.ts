import { OpenAI } from 'langchain/llms/openai';

export const llm = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-3.5-turbo', // Explicitly set the model to a current version
  streaming: true,
  cache: true,
  temperature: 0
} as any);
