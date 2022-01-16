import React from 'react';
import Head from 'next/head';
import LoginForm from '@/components/login-form/login-form';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useApp } from '@/lib/AppContext';

export default function IndexPage() {
  const router = useRouter();
  const { showToast } = useApp();
  return (
    <div style={{ backgroundColor: '#f7f7f7' }}>
      <Head>
        <title>Login Page</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="vh-100 d-flex justify-content-center align-items-center">
        <LoginForm
          onSubmit={async (data) => {
            const res = await axios.post('/api/users/login', data);
            if (res.data.code !== 0) {
              showToast({
                severity: 'error',
                message: res.data.msg,
              });
              return;
            }
            router.replace('/');
          }}
        />
      </main>
    </div>
  );
}
