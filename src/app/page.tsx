'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');

  const handleGenerate = () => {
    console.log('User prompt:', prompt);
    router.push('/puzzle');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md p-6">
        <textarea
          className="w-full h-40 p-4 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Describe the programming task that you want to be solved..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          onClick={handleGenerate}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700 transition"
        >
          Generate
        </button>
      </div>
    </div>
  );
}