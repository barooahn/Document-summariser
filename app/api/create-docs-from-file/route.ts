import fs from 'fs/promises';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { CharacterTextSplitter } from 'langchain/text_splitter';
import { NextApiRequest, NextApiResponse } from 'next';

// Define any additional types you might need
interface ErrorResponse {
  success: false;
  message: string;
  payload: Record<string, unknown>;
}

interface SuccessResponse {
  success: true;
  result: any; // Replace 'any' with the actual type of your result
}

type ApiResponse = ErrorResponse | SuccessResponse;

export const POST = async function (
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

    const fileName = req.body.fileName as string;

    const pdfLoader = new PDFLoader(fileName);
    const docsUploaded = await pdfLoader.load();

    const splitter = new CharacterTextSplitter({
      separator: ' ',
      chunkSize: 1000,
      chunkOverlap: 200
    });

    const result = await splitter.splitDocuments(docsUploaded);

    try {
      const successResponse: SuccessResponse = {
        success: true,
        result
      };
      res.status(200).json(successResponse);
    } catch (error) {
      console.error(error);
      const errorResponse: ErrorResponse = {
        success: false,
        message: 'Internal Server Error',
        payload: {}
      };
      res.status(500).json(errorResponse);
    }
  } catch (error) {
    console.error(error);
    const errorResponse: ErrorResponse = {
      success: false,
      message: 'Internal Server Error',
      payload: {}
    };
    res.status(500).json(errorResponse);
  }
};
