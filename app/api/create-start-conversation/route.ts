import { vectorStoreRetriever } from '@/app/api-helpers/vector-store';
import { llm } from '@/app/config';
import { Message } from '@/types/message';
import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { Document } from 'langchain/dist/document';
import { NextRequest, NextResponse } from 'next/server';

let chainPromise: Promise<ConversationalRetrievalQAChain> | null = null;

async function initChain(
  // collectionName: string,
  docs: Document<Record<string, any>>[]
): Promise<ConversationalRetrievalQAChain> {
  console.log('Attempting to create vector store...');
  const vsr = await vectorStoreRetriever(docs);
  console.log('Created vector store...', vsr !== null);
  return ConversationalRetrievalQAChain.fromLLM(llm, vsr, {
    returnSourceDocuments: true
  });
}

async function getChain(
  // collectionName: string,
  docs: Document<Record<string, any>>[]
): Promise<ConversationalRetrievalQAChain> {
  if (!chainPromise) {
    chainPromise = initChain(docs);
  }
  return await chainPromise;
}

async function parseRequest(request: Request): Promise<{
  question: string;
  history: Message[];
  // collectionName: string;
  docs: Document<Record<string, any>>[];
}> {
  const body = await request.json();
  // if (
  //   typeof body.query !== 'string' ||
  //   typeof body.collectionName !== 'string' ||
  //   !Array.isArray(body.history)
  // ) {
  //   throw new Error('Bad Request');
  // }
  return {
    question: body.query,
    history: body.history ?? [],
    // collectionName: body.collectionName ?? '',
    docs: body.docs
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
    const { question, history, docs } = await parseRequest(request);
    const chain = await getChain(docs);
    const res = await chain.call({
      question: question,
      chat_history: history.map((h) => h.content).join('\n'),
      callbacks: [
        {
          handleLLMNewToken(token: string) {
            // console.log({ token });
          }
        }
      ]
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
