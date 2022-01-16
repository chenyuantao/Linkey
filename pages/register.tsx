import RegisterForm from '@/components/register-form';
import { useApp } from '@/lib/AppContext';
import axios from 'axios';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function RegisterPage(props) {
  const router = useRouter();
  const { showToast } = useApp();
  return (
    <div style={{ backgroundColor: '#f7f7f7' }}>
      <Head>
        <title>Register Page</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="vh-100 d-flex justify-content-center align-items-center">
        <RegisterForm
          onSubmit={async (data) => {
            const res = await axios.post('/api/users/register', data);
            if (res.data.code !== 0) {
              return;
            }
            showToast({
              message: 'Register Success!',
              severity: 'success',
            });
            router.replace('/login');
          }}
          onBack={() => router.replace('/login')}
        />
      </main>
    </div>
  );
}
