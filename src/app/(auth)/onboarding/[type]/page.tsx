import { notFound } from 'next/navigation';
import { OnboardingContainer } from '@/components/onboarding/OnboardingContainer';

interface Props {
  params: {
    type: string;
  };
}

export default function OnboardingPage({ params }: Props) {
  const { type } = params;

  if (!type || !['donor', 'non-donor'].includes(type)) {
    notFound();
  }

  return <OnboardingContainer type={type as 'donor' | 'non-donor'} />;
}
