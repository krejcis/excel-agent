'use client';

import React from 'react';

interface PreviewData {
  name: string;
  count: number;
  totalReward: number;
}

interface PreviewTableProps {
  data: PreviewData[];
}

const PreviewTable: React.FC<PreviewTableProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Shipment Count
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Reward (CZK)
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {row.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {row.count}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                {row.totalReward.toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK' })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PreviewTable;
