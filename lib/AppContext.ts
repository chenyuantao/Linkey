import { useContext, createContext } from 'react';
import type { Socket } from 'socket.io-client';
import type Pusher from 'pusher-js';

export type User = {
  avatar_id: any;
  id: number;
  nickname: string;
};

export type Space = {
  id: number;
  name: string;
  avatar_id?: any;
  permission: number;
  desc: string;
  join_time: Date;
  role: number;
};

export type Channel = {
  channel_id: number;
  channel_name: string;
  channel_privacy: number;
  channel_create_time: Date;
  latest_reply_time?: number;
  latest_reply_content?: string;
  latest_reply_user_id?: number;
  latest_reply_user_nickname?: string;
  join_time: Date;
  role: number;
  is_top: number;
};

export const AppContext = createContext<{
  user: null | User;
  spaces: Array<Space>;
  space: null | Space;
  setSpace: (s: Space) => void;
  channel: null | Channel;
  setChannel: (c: Channel) => void;
  showToast: (
    toast: {
      severity: 'success' | 'error' | 'warning' | 'info';
      message: string;
    } | null,
  ) => void;
  socket?: Socket;
  pusher?: Pusher;
  localMsg: any[];
}>({
  user: null,
  spaces: [],
  space: null,
  channel: null,
  showToast: () => {
    console.error('showToast does not implement by app');
  },
  setSpace: () => {
    console.error('setSpace does not implement by app');
  },
  setChannel: () => {
    console.error('setChannel does not implement by app');
  },
  socket: undefined,
  pusher: undefined,
  localMsg: [],
});

export const useApp = () => useContext(AppContext);
