import { ChromaClient } from 'chromadb';
import { Document } from 'langchain/dist/document';
import { VectorStoreRetriever } from 'langchain/dist/vectorstores/base';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { Chroma } from 'langchain/vectorstores/chroma';

export async function vectorStoreRetriever(
  collectionName: string,
  docs?: Document<Record<string, any>>[]
): Promise<VectorStoreRetriever<Chroma>> {
  const embeddings = new OpenAIEmbeddings();

  const client = new ChromaClient();

  if (!docs && collectionName) {
    console.log('loading vector store...');
    console.log('collectionName', collectionName);
    const collection = await client.getCollection({ name: collectionName });
    if (collection) {
      return (
        await Chroma.fromExistingCollection(embeddings, {
          collectionName: collectionName,
          url: process.env.CHROMA_DB_URL
        })
      ).asRetriever();
    }
    throw new Error('Cannot find collection.');
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

  throw new Error('Documents and collectionName must be provided.');
}
