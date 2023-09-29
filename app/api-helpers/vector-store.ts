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
  if (!docs && directory) {
    console.log(
      'loading                                                                                                                                                                                                                                                                                                                                                                                                                                                vector store... '
    );
    const loadedVectorStore = await HNSWLib.load(
      directory,
      new OpenAIEmbeddings()
    );
    if (loadedVectorStore) {
      return loadedVectorStore.asRetriever();
    }
    throw new Error('Could not load vector store and no documents provided.');
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

  if (docs && directory) {
    console.log('creating vector store... ');
    const vectorStore = await HNSWLib.fromDocuments(
      docs,
      cacheBackedEmbeddings
    );

    await vectorStore.save(directory);

    if (vectorStore) {
      return vectorStore.asRetriever();
    }
  }
  throw new Error('No existing vector store and no documents provided.');
}
