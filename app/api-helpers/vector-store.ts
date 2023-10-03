import { Document } from 'langchain/dist/document';
import { VectorStoreRetriever } from 'langchain/dist/vectorstores/base';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { Chroma } from 'langchain/vectorstores/chroma';

export async function vectorStoreRetriever(
  collectionName: string,
  docs?: Document<Record<string, any>>[]
): Promise<VectorStoreRetriever<Chroma>> {
  const embeddings = new OpenAIEmbeddings();

  if (!docs) {
    console.log('loading vector store...');
    return (
      await Chroma.fromExistingCollection(embeddings, {
        collectionName: collectionName,
        url: 'chroma-production-9178.up.railway.app'
      })
    ).asRetriever();
  }

  if (docs) {
    console.log('creating vector store...');
    return (
      await Chroma.fromDocuments(docs, embeddings, {
        collectionName: collectionName,
        url: 'chroma-production-9178.up.railway.app'
      })
    ).asRetriever();
  }

  throw new Error(
    'Either documents or VECTORSTORES directory must be provided.'
  );
}
