import { vectorStoreRetriever } from '../../api-helpers/vector-store';
import { llm } from '../../config';
import fs from 'fs/promises';
import { RetrievalQAChain } from 'langchain/chains';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { CharacterTextSplitter } from 'langchain/text_splitter';
import { NextResponse } from 'next/server';
import os from 'os';
import path from 'path';

export async function POST(req: Request, res: any) {
  try {
    if (req.method !== 'POST') {
      const errorPayload = {
        success: false,
        message: 'Method not allowed',
        payload: {}
      };
      return NextResponse.json(errorPayload, { status: 405 });
    }

    // read and create temp file
    const pdfData = await req.arrayBuffer();
    const pdfBuffer = Buffer.from(pdfData);
    const tempFileName = path.join(
      os.tmpdir(),
      `temp_uploaded_pdf_${Date.now()}.pdf`
    );
    await fs.writeFile(tempFileName, pdfBuffer);

    const pdfLoader = new PDFLoader(tempFileName);
    const docsUploaded = await pdfLoader.load();
    // const collectionName = `pdf_${Date.now()}`;

    const splitter = new CharacterTextSplitter({
      separator: ' ',
      chunkSize: 1000,
      chunkOverlap: 200
    });
    const docs = await splitter.splitDocuments(docsUploaded);

    const vsr = vectorStoreRetriever(docs);

    const chain = RetrievalQAChain.fromLLM(llm, await vsr);
    console.log('querying chain');
    const chainResponse = await chain.call({
      query: 'Summarize the document in 100 words or less?'
    });
    console.log({ chainResponse });

    const responsePayload = {
      success: true,
      message: 'File was uploaded successfully',
      payload: {
        chainResponse: chainResponse,
        // collectionName: collectionName,
        docs: docs
      }
    };

    await fs.unlink(tempFileName);

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
      // error is something else (not an instance of Error)
      const errorPayload = {
        success: false,
        message: 'An unknown error occurred',
        payload: {}
      };
      return NextResponse.json(errorPayload, { status: 500 });
    }
  }
}
