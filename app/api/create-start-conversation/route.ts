import { Message } from '@/types/message';
import { chain } from '@/utils/chain';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const question: string = body.query;
    const history: Message[] = body.history ?? [];

    const res = await chain.call({
      question: question,
      chat_history: history.map((h) => h.content).join('\n')
    });

    console.log(res.sourceDocuments);

    const links: string[] = Array.from(
      new Set(
        res.sourceDocuments.map(
          (document: { metadata: { source: string } }) =>
            document.metadata.source
        )
      )
    );
    return NextResponse.json({
      role: 'assistant',
      content: res.text,
      links: links
    });
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  }
}