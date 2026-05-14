'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import type { ApiResponse } from '@/types/api';

type HealthData = {
  service: string;
  status: string;
  environment: string;
};

export default function HomePage() {
  const [status, setStatus] = useState('checking...');
  const [message, setMessage] = useState('');

  useEffect(() => {
    apiRequest<ApiResponse<HealthData>>('/health')
      .then((response) => {
        setStatus(response.data.status);
        setMessage(response.message);
      })
      .catch((error) => {
        setStatus('failed');
        setMessage(error.message);
      });
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
        <p className="text-sm font-medium text-slate-500">Phase 0 Check</p>

        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          Accounting App
        </h1>

        <div className="mt-6 rounded-xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">API Status</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{status}</p>
          <p className="mt-2 text-sm text-slate-600">{message}</p>
        </div>
      </div>
    </main>
  );
}
