import { useEffect, useState } from 'react';
import '../styles/index.css';
import 'bootstrap/dist/css/bootstrap.css';
import { useRouter } from 'next/router';
import { AppContext } from '@/lib/AppContext';
import absoluteUrl from 'next-absolute-url';
import { initAxios } from '@/lib/swr-hooks';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import usePusher from '@/lib/use-pusher';
function MyApp({ Component, pageProps, user, spaces }) {
  const router = useRouter();
  const [toast, showToast] = useState(null);
  const [space, setSpace] = useState(spaces?.[0]);
  const [channel, setChannel] = useState(null);
  const { pusher, connecting, localMsg } = usePusher(channel?.channel_id);
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return null;
    }
    initAxios(showToast);
  }, [user]);
  return (
    <AppContext.Provider value={{ user, spaces, space, channel, showToast, setSpace, setChannel, pusher, localMsg }}>
      <Component {...pageProps} />
      <Snackbar
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        open={!!toast}
        autoHideDuration={3000}
        onClose={() => showToast(null)}
      >
        {!!toast && (
          <Alert onClose={() => showToast(null)} severity={toast?.severity} sx={{ width: '100%' }}>
            {toast?.message}
          </Alert>
        )}
      </Snackbar>
      {connecting && (
        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={connecting}>
          <CircularProgress color="inherit" />
        </Backdrop>
      )}
    </AppContext.Provider>
  );
}

MyApp.getInitialProps = async (ctx) => {
  const { req } = ctx.ctx;
  const { origin } = absoluteUrl(req, 'localhost:3000');
  let user = null;
  let spaces = [];
  try {
    const fetchData = async (path: string) =>
      await (
        await fetch(`${origin}${path}`, {
          headers: req ? { Cookie: req.headers.cookie, credentials: 'same-origin' } : undefined,
        })
      ).json();
    const userRes = await fetchData('/api/users/profile');
    if (userRes.code !== 0) {
      return { user, spaces };
    }
    user = userRes.data;
    const spaceRes = await fetchData('/api/users/spaces');
    if (spaceRes.code !== 0) {
      return { user, spaces };
    }
    spaces = spaceRes.data;
    console.log('getInitialProps', { user, spaces });
    return { user, spaces };
  } catch (e) {
    console.error('getInitialProps failed', e);
    return { user, spaces };
  }
};

export default MyApp;
