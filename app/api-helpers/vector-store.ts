import { Document } from 'langchain/dist/document';
import { VectorStoreRetriever } from 'langchain/dist/vectorstores/base';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

export async function vectorStoreRetriever(
  docs: Document<Record<string, any>>[]
): Promise<VectorStoreRetriever<MemoryVectorStore>> {
  const embeddings = new OpenAIEmbeddings();

  console.log('docs', docs);

  if (docs) {
    console.log('creating vector store...');
    return (
      await MemoryVectorStore.fromDocuments(docs, embeddings)
    ).asRetriever();
  }

  console.log('Documents and  must be provided.');
  throw new Error('Documents and  must be provided.');
}
