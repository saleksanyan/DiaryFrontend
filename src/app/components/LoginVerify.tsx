'use client';

import VerificationForm from '../components/VerificationForm';
import Head from 'next/head';

export default function LoginVerificationPage() {
  return (
    <>
      <Head>
        <title>Login Verification | Your App</title>
      </Head>
      <VerificationForm type="login" />
    </>
  );
}
