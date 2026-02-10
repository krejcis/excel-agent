'use client';

import React, { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';

interface DropzoneProps {
  onFileAccepted: (file: File) => void;
  isLoading?: boolean;
}

const Dropzone: React.FC<DropzoneProps> = ({ onFileAccepted, isLoading }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) {
      setIsDragActive(true);
    }
  }, [isLoading]);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (isLoading) return;

    const files = Array.from(e.dataTransfer.files);
    if (files && files.length > 0) {
      const file = files[0];
      // Check for xlsx extension
      if (file.name.endsWith('.xlsx')) {
        onFileAccepted(file);
      } else {
        alert('Please upload a valid .xlsx file.');
      }
    }
  }, [isLoading, onFileAccepted]);

  const onFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLoading) return;
    const files = e.target.files;
    if (files && files.length > 0) {
        const file = files[0];
        if (file.name.endsWith('.xlsx')) {
            onFileAccepted(file);
        } else {
            alert('Please upload a valid .xlsx file.');
        }
    }
  }, [isLoading, onFileAccepted]);

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`
        relative border-2 border-dashed rounded-lg p-12 text-center transition-colors duration-200 ease-in-out cursor-pointer
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      onClick={() => !isLoading && fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".xlsx"
        onChange={onFileInputChange}
        disabled={isLoading}
      />

      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="p-4 bg-blue-100 rounded-full">
            {isLoading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            ) : (
                <Upload className="w-8 h-8 text-blue-600" />
            )}
        </div>
        <div>
          <p className="text-lg font-medium text-gray-700">
            {isLoading ? 'Processing...' : 'Drag & drop your Excel file here'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {isLoading ? 'Please wait' : 'or click to browse'}
          </p>
        </div>
        <div className="flex items-center text-xs text-gray-400 mt-4">
            <FileSpreadsheet className="w-4 h-4 mr-1" />
            <span>Only .xlsx files supported</span>
        </div>
      </div>
    </div>
  );
};

export default Dropzone;
