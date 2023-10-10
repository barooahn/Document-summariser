'use client';

import ChatUI from './ChatUI';
import { MessageModal } from './MessageModal';
import Button from './ui/Button';
import { SuccessDocsResponse } from '@/app/api/create-docs-from-file/route';
import { Dropzone, ExtFile, FileMosaic } from '@dropzone-ui/react';
import { Document } from 'langchain/dist/document';
import React, { useEffect, useRef, useState } from 'react';

type ServerResponse = {
  success: boolean;
  message: string;
  payload: {
    chainResponse: {
      text: string;
    };
    chainResponse2: {
      text: string;
    };
    collectionName: string;
    docs: Document<Record<string, any>>[];
  };
};

const PDFUploader: React.FC = () => {
  const [pdfSummary, setPdfSummary] = useState<ServerResponse | null>(null);
  const pdfSummaryRef = useRef<HTMLDivElement | null>(null);
  const [files, setFiles] = useState<ExtFile[]>([]);
  const [chat, setChat] = useState<boolean>(false);
  const [docs, setDocs] = useState<Document<Record<string, any>>[] | []>([]);
  const [message, setMessage] = useState<string>('');

  const createDocsFromFile = async (
    fileName: string
  ): Promise<SuccessDocsResponse> => {
    try {
      const response = await fetch('/api/create-docs-from-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: fileName
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch vector store: ${response.statusText}`);
      }

      const data = await response.json();
      return data as SuccessDocsResponse;
    } catch (error) {
      console.error(error);
      throw error; // Re-throw the error so it can be handled upstream
    }
  };

  //scroll to summary
  useEffect(() => {
    if (pdfSummary && pdfSummaryRef?.current) {
      const barHeight = '40px';
      pdfSummaryRef.current.style.scrollMargin = barHeight;
      pdfSummaryRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, pdfSummary]);

  const handleChangeStatus = async (file: ExtFile[]) => {
    setFiles(file);
    if (file[0]?.xhr?.status === 200 && file[0]?.xhr?.responseText) {
      const fileNameObj = JSON.parse(file[0]?.xhr?.responseText).payload;
      try {
        setMessage('Creating docs...');
        const docs = (await createDocsFromFile(fileNameObj.filename)).docs;
        setDocs(docs);
        setMessage('Creating summary...');
        const response = await fetch('/api/create-document-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            docs: docs
          })
        });

        if (!response.ok) {
          throw new Error(
            `Failed to create document summary: ${response.statusText}`
          );
        }

        const data = await response.json();
        setPdfSummary(data);
      } catch (error) {
        console.error(error);
        // Optionally set some state to indicate an error occurred
      }
    }
  };

  console.log('message', message);

  return (
    <>
      <section className="bg-black max-w-6xl px-4 py-1 mx-auto sm:py-4 sm:px-6 lg:px-8">
        <Dropzone
          maxFiles={1}
          clickable={true}
          accept="application/pdf"
          value={files}
          label="Drop PDF or click to upload your document"
          uploadConfig={{
            url: '/api/create-processed-file',
            method: 'POST',
            cleanOnUpload: true,
            autoUpload: true
          }}
          onChange={handleChangeStatus}
        >
          {files.map((file, index) => (
            <FileMosaic key={file.id} {...file} preview />
          ))}
        </Dropzone>
      </section>
      <MessageModal message={message} pdfSummary={pdfSummary} />
      {pdfSummary && (
        <>
          <section
            ref={pdfSummaryRef}
            className="bg-black max-w-6xl px-4 py-1 mx-auto sm:py-4 sm:px-6 lg:px-4"
          >
            <p className="text-xl py-6 font-extrabold text-pink-500 lg:text-4xl">
              A summary of your document
            </p>
            <div
              dangerouslySetInnerHTML={{
                __html: pdfSummary.payload.chainResponse?.text
              }}
            />
            {/* <h2 className="text-2xl my-8 font-extrabold text-pink-500 sm:text-6xl">
              Key points about the document
            </h2>
            <div
              className="flex flex-col"
              dangerouslySetInnerHTML={{
                __html: pdfSummary.payload.chainResponse2?.text
              }}
            /> */}
          </section>
          <div className="flex justify-center">
            <Button
              onClick={() => setChat(true)}
              className={`${'ml-0.5 my-6 relative w-1/2 border border-transparent text-zinc-400'} rounded-md m-1 py-2 text-sm font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 focus:z-10 sm:w-auto sm:px-8`}
            >
              Chat now
            </Button>
          </div>
        </>
      )}
      {chat && (
        <section className="bg-black max-w-6xl px-4 mx-auto sm:py-4 sm:px-6 lg:px-4">
          <ChatUI docs={docs ?? []} />
        </section>
      )}
    </>
  );
};

export default PDFUploader;
