import { vectorStoreRetriever } from '../../api-helpers/vector-store';
import { llm } from '../../config';
import { RetrievalQAChain } from 'langchain/chains';
import { NextResponse } from 'next/server';

export async function POST(request: Request, response: any) {
  try {
    if (request.method !== 'POST') {
      const errorPayload = {
        success: false,
        message: 'Method not allowed',
        payload: {}
      };
      return NextResponse.json(errorPayload, { status: 405 });
    }

    const body = await request.json();
    const docs = body.docs;

    const vsr = vectorStoreRetriever(docs);
    const chain = RetrievalQAChain.fromLLM(llm, await vsr);
    console.log('querying chain');
    const chainResponse = await chain.call({
      query:
        'Summarize the document in 100 words or less.  Format the reply into logical paragraphs using HTML syntax.  Highligh important facts in bold.'
    });
    // const chainResponse2 = await chain.call({
    //   query:
    //     'list the ten most important points of the document. Format the reply into a HTML unordered list.'
    // });
    const chainResponse2 = '';

    const responsePayload = {
      success: true,
      message: 'File was uploaded successfully',
      payload: {
        chainResponse: chainResponse,
        chainResponse2: chainResponse2
      }
    };

    // await fs.unlink(tempFileName);

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      const errorPayload = {
        success: false,
        message: error.message,
        payload: {}
      };
      return NextResponse.json(errorPayload, { status: 500 });
    } else {
      const errorPayload = {
        success: false,
        message: 'An unknown error occurred',
        payload: {}
      };
      return NextResponse.json(errorPayload, { status: 500 });
    }
  }
}
