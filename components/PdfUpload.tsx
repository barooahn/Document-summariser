'use client';

import { Dropzone, ExtFile, FileMosaic } from '@dropzone-ui/react';
import React, { useState } from 'react';

type ServerResponse = {
  success: boolean;
  message: string;
  payload: {
    chainResponse: {
      text: string;
    };
  };
};
const PDFUploader: React.FC = () => {
  const [pdfSummary, setPdfSummary] = useState<ServerResponse | null>(null);
  const [files, setFiles] = useState<ExtFile[]>([]);

  const handleFilesChange = (incomingFiles: ExtFile[]) => {
    const { uploadStatus, errors, xhr } = incomingFiles[0];

    setFiles(incomingFiles);
    if (uploadStatus === 'success' && xhr?.response) {
      const parsedResponse: ServerResponse = JSON.parse(xhr?.response);
      setPdfSummary(parsedResponse);
    }
    if (errors) {
      console.log('incomingFiles[0]?.errors', errors);
    }
  };
  const handleUploadFinish = () => {
    console.log('finished uploading');
  };

  return (
    <>
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
        onUploadFinish={handleUploadFinish}
      >
        {files.map((file, index) => (
          <FileMosaic key={file.id} {...file} preview />
        ))}
      </Dropzone>

      {pdfSummary && <div>{pdfSummary.payload.chainResponse?.text}</div>}
    </>
  );
};

export default PDFUploader;
