// client/app/page.js
'use client';

import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { designStore } from '@/stores/designStore';

const HomePage = () => {
  const router = useRouter();
  const { initialize, setDesignId } = designStore();
  const handleStartDesign = () => {
    initialize();
    const designId = uuidv4();
    setDesignId(designId);
    router.push(`/editor/${designId}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-3xl font-bold underline">Welcome to DIY T-Shirt Design!</h1>
      <p className="mt-4">Unleash your creativity and design your unique T-shirt.</p>
      <button
        onClick={handleStartDesign}
        className="mt-8 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Start Designing Your T-Shirt
      </button>
    </main>
  );
};

export default HomePage;