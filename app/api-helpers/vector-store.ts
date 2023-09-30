import { Document } from 'langchain/dist/document';
import { VectorStoreRetriever } from 'langchain/dist/vectorstores/base';
import { CacheBackedEmbeddings } from 'langchain/embeddings/cache_backed';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { InMemoryStore } from 'langchain/storage/in_memory';
import { HNSWLib } from 'langchain/vectorstores/hnswlib';

export async function vectorStoreRetriever(
  docs?: Document<Record<string, any>>[]
): Promise<VectorStoreRetriever<HNSWLib>> {
  const directory = process.env.VECTORSTORES;
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
