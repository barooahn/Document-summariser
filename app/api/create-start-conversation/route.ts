import { vectorStoreRetriever } from '@/app/api-helpers/vector-store';
import { llm } from '@/app/config';
import { Message } from '@/types/message';
import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 0;

let chainPromise: Promise<ConversationalRetrievalQAChain> | null = null;

async function initChain(
  collectionName: string
): Promise<ConversationalRetrievalQAChain> {
  console.log('attempting to load vector store...');
  const vsr = await vectorStoreRetriever(collectionName);
  console.log('have vector store...', vsr !== null);
  return ConversationalRetrievalQAChain.fromLLM(llm, vsr, {
    returnSourceDocuments: true
  });
}

async function getChain(
  collectionName: string
): Promise<ConversationalRetrievalQAChain> {
  if (!chainPromise) {
    chainPromise = initChain(collectionName);
  }
  return await chainPromise;
}

async function parseRequest(
  request: Request
): Promise<{ question: string; history: Message[]; collectionName: string }> {
  const body = await request.json();
  if (
    typeof body.query !== 'string' ||
    typeof body.collectionName !== 'string' ||
    !Array.isArray(body.history)
  ) {
    throw new Error('Bad Request');
  }
  return {
    question: body.query,
    history: body.history ?? [],
    collectionName: body.collectionName ?? ''
  };
}

async function formResponse(res: any): Promise<NextResponse> {
  return NextResponse.json({
    role: 'assistant',
    content: res.text
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { question, history, collectionName } = await parseRequest(request);
    const chain = await getChain(collectionName);
    const res = await chain.call({
      question: question,
      chat_history: history.map((h) => h.content).join('\n')
    });
    return await formResponse(res);
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ error: (error as Error).message }),
      { status: (error as Error).message === 'Bad Request' ? 400 : 500 }
    );
  }
}
