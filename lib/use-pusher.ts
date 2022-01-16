import { useMemo, useState, useEffect } from 'react';
import Pusher from 'pusher-js';
import { useEvent } from 'react-use';
import { useApp } from './AppContext';

export default function usePusher(channel_id: number) {
  const { showToast } = useApp();
  const [connecting, setConnecting] = useState(true);
  const [localMsg, setLocalMsg] = useState([]);
  const pusher = useMemo(
    () =>
      new Pusher('10d92db2b99424dedc1d', {
        cluster: 'ap3',
      }),
    [],
  );
  pusher.connection.bind('error', (err) => {
    console.error('[socket] error', err);
    err?.error?.data?.message &&
      showToast({
        severity: 'error',
        message: err.error.data.message,
      });
  });
  pusher.connection.bind('state_change', (state) => {
    console.log('[socket] state change', state);
    setConnecting(state.current !== 'connected');
  });
  useEffect(() => {
    if (channel_id) {
      const channel = pusher.subscribe(`channel_${channel_id}`);
      channel.bind('new_channel_msg', (msg) => {
        console.log('[socket] new_channel_msg', msg);
        setLocalMsg((l) => [msg, ...l]);
      });
      return () => {
        channel.unbind_all();
        channel.unsubscribe();
      };
    }
  }, [channel_id]);
  useEvent('beforeunload', () => pusher?.disconnect?.());
  return { pusher, localMsg, connecting };
}
