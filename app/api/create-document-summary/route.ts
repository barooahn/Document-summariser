import { vectorStoreRetriever } from '../../api-helpers/vector-store';
import { llm } from '../../config';
import fs from 'fs';
import { RetrievalQAChain } from 'langchain/chains';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { NextResponse } from 'next/server';
import os from 'os';
import path from 'path';

export async function POST(req: Request, res: any) {
  if (req.method === 'POST') {
    // read file and create temp file
    const pdfData = await req.arrayBuffer();
    const pdfBuffer = Buffer.from(pdfData);
    const tempFileName = path.join(os.tmpdir(), 'temp_uploaded_pdf.pdf');
    fs.writeFileSync(tempFileName, pdfBuffer);

    const pdfLoader = new PDFLoader(tempFileName);
    const docs = await pdfLoader.load();

    // May need to split documents later
    // const splitter = new CharacterTextSplitter({
    //   separator: ' ',
    //   chunkSize: 1000,
    //   chunkOverlap: 3
    // });
    // const docs = await splitter.createDocuments(document);

    const vsr = vectorStoreRetriever(docs);

    const chain = RetrievalQAChain.fromLLM(llm, await vsr);
    console.log('querying chain');
    const chainResponse = await chain.call({
      query: 'Summarise the document in 100 words or less?'
    });
    console.log({ chainResponse });

    const responsePayload = {
      success: true,
      message: 'File was uploaded successfully',
      payload: {
        chainResponse: chainResponse
      }
    };

    fs.unlinkSync(tempFileName);

    return NextResponse.json(responsePayload);
  } else {
    const errorPayload = {
      success: false,
      message: 'File not found',
      payload: {}
    };

    return NextResponse.json(errorPayload, { status: 405 });
  }
}

// const model = new OpenAI({ temperature: 0 });
// const tools = [
//   // new SerpAPI(process.env.SERPAPI_API_KEY, {
//   // 	location: "London, United Kingdom",
//   // 	hl: "en",
//   // 	gl: "uk",
//   // }),
//   // new WikipediaQueryRun(),
//   // qaTool,
//   // qaVotingTool,
//   qaAPITool
// ];

// const memory = new BufferMemory();

// const executor = await initializeAgentExecutorWithOptions(tools, model, {
//   agentType: 'zero-shot-react-description',
//   verbose: true
// });

// const input = 'Which divisions did Diane Abbott vote in and how did she vote?';

// const result = await executor.call({
//   input
// });

// console.log('result', result);
