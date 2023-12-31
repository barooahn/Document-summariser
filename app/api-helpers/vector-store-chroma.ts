import { Document } from 'langchain/dist/document';
import { VectorStoreRetriever } from 'langchain/dist/vectorstores/base';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { Chroma } from 'langchain/vectorstores/chroma';

export async function vectorStoreRetriever(
  collectionName: string,
  docs?: Document<Record<string, any>>[]
): Promise<VectorStoreRetriever<Chroma>> {
  const embeddings = new OpenAIEmbeddings();

  if (!docs && collectionName) {
    console.log('loading vector store...');
    console.log('collectionName', collectionName);

    return (
      await Chroma.fromExistingCollection(embeddings, {
        collectionName: collectionName,
        url: process.env.CHROMA_DB_URL
      })
    ).asRetriever();
  }

  if (docs && collectionName) {
    console.log('creating vector store...');
    console.log('collectionName', collectionName);
    return (
      await Chroma.fromDocuments(docs, embeddings, {
        collectionName: collectionName,
        url: process.env.CHROMA_DB_URL
      })
    ).asRetriever();
  }

  console.log('Documents and collectionName must be provided.');
  throw new Error('Documents and collectionName must be provided.');
}
