'use client';

import ChatUI from './ChatUI';
import Button from './ui/Button';
import { Dropzone, ExtFile, FileMosaic } from '@dropzone-ui/react';
import { Document } from 'langchain/dist/document';
import React, { DOMAttributes, useEffect, useRef, useState } from 'react';

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

  const collectionName = pdfSummary?.payload?.collectionName || '';
  const docs = pdfSummary?.payload?.docs;

  const handleFilesChange = (incomingFiles: ExtFile[]) => {
    const { uploadStatus, errors, xhr } = incomingFiles[0];

    setFiles(incomingFiles);
    if (uploadStatus === 'success' && xhr?.response) {
      try {
        const parsedResponse: ServerResponse = JSON.parse(xhr?.response);
        setPdfSummary(parsedResponse);
      } catch (error) {
        console.error('Failed to parse server response:', error);
        console.error('Response:', xhr?.response);
      }
    }
    if (uploadStatus === 'error') {
      console.error('Upload Error:', xhr?.statusText);
    }
    if (errors) {
      console.log('incomingFiles[0]?.errors', errors);
    }
  };

  //scroll to summary
  useEffect(() => {
    if (pdfSummaryRef.current) {
      pdfSummaryRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  return (
    <>
      <section className="bg-black max-w-6xl px-4 py-1 mx-auto sm:py-4 sm:px-6 lg:px-8">
        <Dropzone
          onChange={handleFilesChange}
          maxFiles={1}
          clickable={true}
          accept="application/pdf"
          value={files}
          label="Drop PDF or click to upload your document"
          uploadConfig={{
            url: '/api/create-document-summary',
            method: 'POST',
            cleanOnUpload: true,
            autoUpload: true
          }}
        >
          {files.map((file, index) => (
            <FileMosaic key={file.id} {...file} preview />
          ))}
        </Dropzone>
      </section>
      {pdfSummary && (
        <>
          <section className="bg-black max-w-6xl px-4 py-1 mx-auto sm:py-4 sm:px-6 lg:px-4">
            <div
              ref={pdfSummaryRef}
              dangerouslySetInnerHTML={{
                __html: pdfSummary.payload.chainResponse?.text
              }}
            />
            <h2 className="text-2xl my-8 font-extrabold text-pink-500 sm:text-center sm:text-6xl">
              Key points about the document
            </h2>
            <div
              className="flex flex-col"
              dangerouslySetInnerHTML={{
                __html: pdfSummary.payload.chainResponse2?.text
              }}
            />
          </section>
          <div className="flex justify-center">
            <Button
              onClick={() => setChat(true)}
              className={`${'ml-0.5 my-8 relative w-1/2 border border-transparent text-zinc-400'} rounded-md m-1 py-2 text-sm font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 focus:z-10 sm:w-auto sm:px-8`}
            >
              Chat now
            </Button>
          </div>
        </>
      )}
      {chat && (
        <section className="bg-black max-w-6xl px-4 py-1 mx-auto sm:py-4 sm:px-6 lg:px-4">
          <ChatUI collectionName={collectionName} docs={docs ?? []} />
        </section>
      )}
    </>
  );
};

export default PDFUploader;
