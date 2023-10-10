import { Document } from 'langchain/dist/document';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { CharacterTextSplitter } from 'langchain/text_splitter';
import { NextResponse } from 'next/server';
import { buffer } from 'stream/consumers';

interface ErrorResponse {
  success: false;
  message: string;
  payload: Record<string, unknown>;
}

export interface SuccessDocsResponse {
  success: true;
  docs: Document<Record<string, any>>[];
}

async function streamToBuffer(
  readableStream: ReadableStream<Uint8Array>
): Promise<Buffer> {
  const reader = readableStream.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

export async function POST(req: Request, res: Response) {
  try {
    if (req.method !== 'POST') {
      const errorPayload: ErrorResponse = {
        success: false,
        message: 'Method not allowed',
        payload: {}
      };
      return NextResponse.json(errorPayload, { status: 405 });
    }

    if (req.body === null) {
      const errorPayload: ErrorResponse = {
        success: false,
        message: 'Request body cannot be null',
        payload: {}
      };
      return NextResponse.json(errorPayload, { status: 400 });
    }

    if (req.body instanceof ReadableStream) {
      const bodyBuffer = await streamToBuffer(req.body);
      const body = bodyBuffer.toString();
      const parsedBody = JSON.parse(body);
      const fileName = parsedBody.fileName;

      const pdfLoader = new PDFLoader(fileName);
      const docsUploaded = await pdfLoader.load();

      const splitter = new CharacterTextSplitter({
        separator: ' ',
        chunkSize: 1000,
        chunkOverlap: 200
      });

      const docs = await splitter.splitDocuments(docsUploaded);

      try {
        const successResponse: SuccessDocsResponse = {
          success: true,
          docs
        };
        return NextResponse.json(successResponse, { status: 200 });
      } catch (error) {
        console.error(error);
        const errorResponse: ErrorResponse = {
          success: false,
          message: 'Internal Server Error',
          payload: {}
        };
        return NextResponse.json(errorResponse, { status: 500 });
      }
    } else {
      const errorPayload: ErrorResponse = {
        success: false,
        message: 'Request body is not a readable stream',
        payload: {}
      };
      return NextResponse.json(errorPayload, { status: 400 });
    }
  } catch (error) {
    console.error(error);
    const errorResponse: ErrorResponse = {
      success: false,
      message: 'Internal Server Error',
      payload: {}
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
