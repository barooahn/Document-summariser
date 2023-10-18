import { FC, useEffect, useState } from 'react';

// Modal Component
interface ModalProps {
  message: string;
  pdfSummary: any; // Adjust the type based on your actual data structure
}

export const MessageModal: FC<ModalProps> = ({ message, pdfSummary }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (message === 'Creating docs...') {
      setIsOpen(true);
    }
    if (pdfSummary) {
      setIsOpen(false);
    }
  }, [message, pdfSummary]);

  return (
    isOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 shadow-lg">
          <span className="text-gray-700 p-8">{message}</span>
        </div>
      </div>
    )
  );
};
