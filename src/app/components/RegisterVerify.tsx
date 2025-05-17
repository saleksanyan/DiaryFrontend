'use client';

import VerificationForm from '../components/VerificationForm';
import Head from 'next/head';

export default function RegisterVerificationPage() {
  return (
    <>
      <Head>
        <title>Email Verification | Your App</title>
      </Head>
      <VerificationForm type="register" />
    </>
  );
}
