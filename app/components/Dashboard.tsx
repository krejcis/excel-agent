'use client';

import React, { useState } from 'react';
import Dropzone from './Dropzone';
import PreviewTable from './PreviewTable';
import { processExcelFile } from '../utils/calculation';
import * as XLSX from 'xlsx';
import { Download, AlertCircle, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileAccepted = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    setPreviewData(null);
    setDownloadUrl(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await processExcelFile(arrayBuffer);

      setPreviewData(result.preview);

      // Create download link
      const wbout = XLSX.write(result.workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setSuccessMessage(`Successfully processed "${file.name}"!`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while processing the file.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Shipment Reward Calculator</h1>
        <p className="text-gray-500">
          Upload your shipment Excel file to calculate progressive tiered rewards.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <Dropzone onFileAccepted={handleFileAccepted} isLoading={isLoading} />

        {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start text-red-700">
                <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
            </div>
        )}

        {successMessage && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start text-green-700">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{successMessage}</span>
            </div>
        )}
      </div>

      {previewData && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl font-semibold text-gray-800">Preview (First 5 Rows)</h2>

                {downloadUrl && (
                    <a
                        href={downloadUrl}
                        download="calculated_rewards.xlsx"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download Calculated Excel
                    </a>
                )}
            </div>

            <PreviewTable data={previewData} />

             <p className="text-sm text-gray-500 text-center">
                * Only the first 5 rows are shown in the preview. The downloaded file contains all rows.
            </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
