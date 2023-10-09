import fs from 'fs/promises';
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
    const responsePayload = {
      success: true,
      message: 'File was uploaded successfully',
      payload: {
        filename: tempFileName
      }
    };

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
