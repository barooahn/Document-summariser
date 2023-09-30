import { Document } from 'langchain/dist/document';
import { VectorStoreRetriever } from 'langchain/dist/vectorstores/base';
import { CacheBackedEmbeddings } from 'langchain/embeddings/cache_backed';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { InMemoryStore } from 'langchain/storage/in_memory';
import { HNSWLib } from 'langchain/vectorstores/hnswlib';
import path from 'path';

export async function vectorStoreRetriever(
  docs?: Document<Record<string, any>>[]
): Promise<VectorStoreRetriever<HNSWLib>> {
  if (!process.env.VECTORSTORES) {
    throw new Error('VECTORSTORES environment variable is not set.');
  }
  const directory = path.join(process.cwd(), process.env.VECTORSTORES);
  const underlyingEmbeddings = new OpenAIEmbeddings();

  if (!docs && directory) {
    console.log('loading vector store...');
    return (await HNSWLib.load(directory, underlyingEmbeddings)).asRetriever();
  }

  if (docs && directory) {
    console.log('creating vector store...');
    const inMemoryStore = new InMemoryStore();
    const cacheBackedEmbeddings = CacheBackedEmbeddings.fromBytesStore(
      underlyingEmbeddings,
      inMemoryStore,
      { namespace: underlyingEmbeddings.modelName }
    );
    const vectorStore = await HNSWLib.fromDocuments(
      docs,
      cacheBackedEmbeddings
    );
    await vectorStore.save(directory);
    return vectorStore.asRetriever();
  }

  throw new Error(
    'Either documents or VECTORSTORES directory must be provided.'
  );
}
