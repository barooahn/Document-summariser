import { vectorStoreRetriever } from '@/app/api-helpers/vector-store';
import { llm } from '@/app/config';
import { ConversationalRetrievalQAChain } from 'langchain/chains';

async function initChain() {
  const vsr = await vectorStoreRetriever('hellol');

  console.log('vsr', vsr);

  return ConversationalRetrievalQAChain.fromLLM(llm, vsr, {
    returnSourceDocuments: true
  });
}

export const chain = await initChain();
