import { GetServerSideProps } from 'next';
import { OnboardingContainer } from '@/components/onboarding/OnboardingContainer';

interface OnboardingPageProps {
  type: 'donor' | 'non-donor';
}

export default function OnboardingPage({ type }: OnboardingPageProps) {
  return <OnboardingContainer type={type} />;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const type = params?.type as string;

  if (!type || !['donor', 'non-donor'].includes(type)) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      type,
    },
  };
};
