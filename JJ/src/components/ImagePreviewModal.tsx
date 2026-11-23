// src/components/ImagePreviewModal.tsx
import React from 'react';
import { X, Download } from 'lucide-react';

interface ImagePreviewModalProps {
  isOpen: boolean;
  imageUrl?: string;
  title?: string;
  onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  isOpen,
  imageUrl,
  title = 'รูปภาพใบเสร็จ',
  onClose,
}) => {
  if (!isOpen || !imageUrl) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `ใบเสร็จ_${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative max-w-lg w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 bg-slate-800/80 border-b border-slate-700">
          <h3 className="text-sm font-medium text-white truncate max-w-[200px]">
            {title}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="p-1.5 text-slate-300 hover:text-white bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
              title="บันทึกรูป"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
              title="ปิด"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/40">
          <img
            src={imageUrl}
            alt={title}
            className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain shadow-md"
          />
        </div>
      </div>
    </div>
  );
};
