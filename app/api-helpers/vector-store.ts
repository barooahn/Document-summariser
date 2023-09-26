import { pinecone } from '@/utils/pinecone-client';
import { Document } from 'langchain/dist/document';
import { VectorStoreRetriever } from 'langchain/dist/vectorstores/base';
import { CacheBackedEmbeddings } from 'langchain/embeddings/cache_backed';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { InMemoryStore } from 'langchain/storage/in_memory';
import { PineconeStore } from 'langchain/vectorstores/pinecone';

export async function vectorStoreRetriever(
  docs: Document<Record<string, any>>[] | null = null
): Promise<VectorStoreRetriever<PineconeStore>> {
  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX ?? '');
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

  const vectorStore = await PineconeStore.fromDocuments(
    docs,
    cacheBackedEmbeddings,
    {
      pineconeIndex: pineconeIndex,
      textKey: 'text'
    }
  );

  return vectorStore.asRetriever();
}