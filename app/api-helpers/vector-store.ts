// import { pinecone } from '@/utils/pinecone-client';
import { Document } from 'langchain/dist/document';
import { VectorStoreRetriever } from 'langchain/dist/vectorstores/base';
import { CacheBackedEmbeddings } from 'langchain/embeddings/cache_backed';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { InMemoryStore } from 'langchain/storage/in_memory';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

export async function vectorStoreRetriever(
  docs: Document<Record<string, any>>[] | null = null
): Promise<VectorStoreRetriever<MemoryVectorStore>> {
  if (docs === null) {
    throw new Error('No existing vector store and no documents provided.');
  }

  const underlyingEmbeddings = new OpenAIEmbeddings();
  const inMemoryStore = new InMemoryStore();

  const cacheBackedEmbeddings = CacheBackedEmbeddings.fromBytesStore(
    underlyingEmbeddings,
    inMemoryStore,
    {
      namespace: underlyingEmbeddings.modelName
    }
  );

  const vectorStore = await MemoryVectorStore.fromDocuments(
    docs,
    cacheBackedEmbeddings
  );

  return vectorStore.asRetriever();
}
