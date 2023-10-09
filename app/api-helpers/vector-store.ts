import { Document } from 'langchain/dist/document';
import { VectorStoreRetriever } from 'langchain/dist/vectorstores/base';
import { CacheBackedEmbeddings } from 'langchain/embeddings/cache_backed';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { InMemoryStore } from 'langchain/storage/in_memory';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

export async function vectorStoreRetriever(
  docs: Document<Record<string, any>>[]
): Promise<VectorStoreRetriever<MemoryVectorStore>> {
  const underlyingEmbeddings = new OpenAIEmbeddings();

  const inMemoryStore = new InMemoryStore();

  const cacheBackedEmbeddings = CacheBackedEmbeddings.fromBytesStore(
    underlyingEmbeddings,
    inMemoryStore,
    {
      namespace: underlyingEmbeddings.modelName
    }
  );

  if (docs) {
    console.log('creating vector store...');
    return (
      await MemoryVectorStore.fromDocuments(docs, cacheBackedEmbeddings)
    ).asRetriever();
  }

  console.log('Documents and  must be provided.');
  throw new Error('Documents and  must be provided.');
}
