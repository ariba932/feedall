import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { OnboardingContainer } from '@/components/onboarding/OnboardingContainer';

export const metadata: Metadata = {
  title: 'Onboarding - FeedAll',
  description: 'Join FeedAll as a donor or service provider',
};

type Params = { type: 'donor' | 'non-donor' };

export function generateStaticParams() {
  return [
    { type: 'donor' },
    { type: 'non-donor' },
  ];
}


export default async function Page({ params }: { params: Promise<Params> }) {
  const { type } = await params; // Await the params object

  if (!['donor', 'non-donor'].includes(type)) {
    notFound();
  }

  return <OnboardingContainer type={type} />;
}
