import SocketIOClient from 'socket.io-client';
import { useMemo, useState, useEffect } from 'react';
import { useEvent } from 'react-use';

export default function useSocket(channel_id: number) {
  const [connecting, setConnecting] = useState(true);
  const [localMsg, setLocalMsg] = useState([]);
  const socket = useMemo(() => {
    const socket = SocketIOClient(process.env.BASE_URL, {
      path: '/api/socketio',
    });
    socket.on('connect', () => {
      setConnecting(false);
      console.log('[socket] connect', socket.id);
    });
    socket.on('disconnect', () => {
      setConnecting(true);
      console.error('[socket] disconnect', socket.id);
    });
    socket.on('error', (e) => {
      setConnecting(true);
      console.error('[socket] error', e);
    });
    socket.on('new_channel_msg', (msg) => {
      console.log('[socket] new_channel_msg', msg);
      setLocalMsg((l) => [...l, msg]);
    });
    return socket;
  }, []);
  useEffect(() => {
    if (channel_id && socket) {
      const roomId = `channel_${channel_id}`;
      socket.emit('joinRoom', roomId);
      return () => {
        socket.emit('leaveRoom', roomId);
      };
    }
  }, [channel_id, socket]);
  useEvent('beforeunload', () => socket?.disconnect?.());
  return { socket, connecting, localMsg };
}
