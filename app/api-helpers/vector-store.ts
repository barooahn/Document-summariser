import { Document } from 'langchain/dist/document';
import { VectorStoreRetriever } from 'langchain/dist/vectorstores/base';
import { CacheBackedEmbeddings } from 'langchain/embeddings/cache_backed';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { InMemoryStore } from 'langchain/storage/in_memory';
import { HNSWLib } from 'langchain/vectorstores/hnswlib';

export async function vectorStoreRetriever(
  docs: Document<Record<string, any>>[] | null = null
): Promise<VectorStoreRetriever<HNSWLib>> {
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

  const vectorStore = await HNSWLib.fromDocuments(docs, cacheBackedEmbeddings);

  return vectorStore.asRetriever();
}
