import { Document } from 'langchain/dist/document';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { CharacterTextSplitter } from 'langchain/text_splitter';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from 'next/server';

// Define any additional types you might need
interface ErrorResponse {
  success: false;
  message: string;
  payload: Record<string, unknown>;
}

export interface SuccessDocsResponse {
  success: true;
  docs: Document<Record<string, any>>[]; // Replace 'any' with the actual type of your result
}

type ApiResponse = ErrorResponse | SuccessDocsResponse;

export async function POST(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  try {
    if (req.method !== 'POST') {
      const errorPayload: ErrorResponse = {
        success: false,
        message: 'Method not allowed',
        payload: {}
      };
      return res.status(405).json(errorPayload);
    }
    const chunks = [];
    for await (const chunk of req.body) {
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks).toString();
    const parsedBody = JSON.parse(body);
    const fileName = parsedBody.fileName;
    console.log('fileName', fileName);

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
