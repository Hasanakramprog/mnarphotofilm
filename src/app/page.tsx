import { Suspense } from 'react';
import PublicSchedule from '@/components/public/PublicSchedule';

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default function HomePage() {
  return (
    <main>
      <Suspense fallback={<div className="min-h-screen" />}>
        <PublicSchedule />
      </Suspense>
    </main>
  );
}
