'use client';

import { postData } from '@/utils/helpers';
import React, { useRef, useState } from 'react';

type PdfResponse = {
  text: string;
};

const PDFUploader: React.FC = () => {
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [pdfSummary, setPdfSummary] = useState<PdfResponse>();

  const handleFileChange = async () => {
    const file = pdfInputRef.current?.files?.[0];

    // Check if a file was selected
    if (!file) {
      alert('Please select a PDF to upload.');
      return;
    }

    // Validate file extension for .pdf
    if (!file.name.endsWith('.pdf')) {
      alert('The selected file is not a PDF. Please upload a valid PDF.');
      return;
    }

    // Create FormData to handle file upload
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await postData({
        url: '/api/create-document-summary',
        data: formData,
        contentType: 'multipart/form-data'
      });
      console.log('Server Response:', response);
      if (response) {
        setPdfSummary(response);
      }
    } catch (error) {
      console.error('Error uploading PDF:', error);
      alert('Upload failed. Please try again later.');
    }
  };

  return (
    <>
      <input
        type="file"
        ref={pdfInputRef}
        className="w-1/2 p-3 rounded-md bg-zinc-800"
        placeholder="Your PDF"
        accept=".pdf"
        onChange={handleFileChange}
      />
      {pdfSummary && <div>{pdfSummary.text}</div>}
    </>
  );
};

export default PDFUploader;
