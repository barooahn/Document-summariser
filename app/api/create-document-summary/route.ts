import { VectorDBQAChain, APIChain } from 'langchain/chains';
// import { FaissStore } from "langchain/vectorstores/faiss";
import { RetrievalQAChain } from 'langchain/chains';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { CacheBackedEmbeddings } from 'langchain/embeddings/cache_backed';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { OpenAI } from 'langchain/llms/openai';
import { InMemoryStore } from 'langchain/storage/in_memory';
import { HNSWLib } from 'langchain/vectorstores/hnswlib';
// import 'dotenv/config';
import fs from 'fs';
import os from 'os';
import path from 'path';

export async function POST(req: Request) {
  if (req.method === 'POST') {
    // Assuming you are posting the PDF as a blob or file in the request body
    const pdfData = await req.arrayBuffer();
    const pdfBuffer = Buffer.from(pdfData);
    // Save buffer to a temporary file
    const tempFileName = path.join(os.tmpdir(), 'temp_uploaded_pdf.pdf');
    fs.writeFileSync(tempFileName, pdfBuffer);

    const pdfLoader = new PDFLoader(tempFileName);
    const docs = await pdfLoader.load();

    // After you're done, you might want to delete the temp file
    fs.unlinkSync(tempFileName);

    const llm = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      temperature: 0.9
    } as any);

    const underlyingEmbeddings = new OpenAIEmbeddings();
    const inMemoryStore = new InMemoryStore();

    const cacheBackedEmbeddings = CacheBackedEmbeddings.fromBytesStore(
      underlyingEmbeddings,
      inMemoryStore,
      {
        namespace: underlyingEmbeddings.modelName
      }
    );

    // No keys logged yet since the cache is empty
    for await (const key of inMemoryStore.yieldKeys()) {
      console.log(key);
    }

    let time = Date.now();
    const vectorStore = await HNSWLib.fromDocuments(
      docs,
      cacheBackedEmbeddings
    );

    const vectorStoreRetriever = vectorStore.asRetriever();

    const chain = RetrievalQAChain.fromLLM(llm, vectorStoreRetriever);
    const res = await chain.call({
      query: 'What is the document about?'
    });
    console.log({ res });
  } else {
    return new Response('File not found', {
      headers: { Allow: 'POST' },
      status: 405
    });
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
