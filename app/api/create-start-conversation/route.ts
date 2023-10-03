import { vectorStoreRetriever } from '@/app/api-helpers/vector-store';
import { llm } from '@/app/config';
import { Message } from '@/types/message';
import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { NextResponse } from 'next/server';

let chain: ConversationalRetrievalQAChain | null = null;

async function initChain(
  collectionName: string
): Promise<ConversationalRetrievalQAChain> {
  const vsr = await vectorStoreRetriever(collectionName);
  console.log('vsr', vsr);
  return ConversationalRetrievalQAChain.fromLLM(llm, vsr, {
    returnSourceDocuments: true
  });
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const question: string = body.query;
    const history: Message[] = body.history ?? [];
    const collectionName: string = body.collectionName ?? '';

    if (!chain) {
      chain = await initChain(collectionName);
    }

    const res = await chain.call({
      question: question,
      chat_history: history.map((h) => h.content).join('\n')
    });

    return NextResponse.json({
      role: 'assistant',
      content: res.text
    });
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    );
  }
}
