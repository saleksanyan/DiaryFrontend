"use client";

import VerificationForm from '../components/VerificationForm';
import Head from 'next/head';
import { useSearchParams } from 'next/navigation';

export default function ResetVerificationPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  return (
    <>
      <Head>
        <title>Password Reset | Your App</title>
      </Head>
      <VerificationForm type="password-reset" email={email} />
    </>
  );
}