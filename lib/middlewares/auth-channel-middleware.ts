import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../db';
import { MEMBER_ROLE } from '../typings';
import authMiddleware, { AuthResponse } from './auth-middleware';
import channelMiddleware, { ChannelResponse } from './channel-middleware';

export default (req: NextApiRequest, res: NextApiResponse) =>
  new Promise<{ user: AuthResponse; channel: ChannelResponse; role: MEMBER_ROLE }>(async (resolve, reject) => {
    try {
      const channel = await channelMiddleware(req, res);
      const user = await authMiddleware(req, res);
      const [user_channel] = await query(`SELECT role FROM users_channels WHERE user_id = ? AND channel_id = ? AND status = 1`, [user.id, channel.id]);
      if (!user_channel?.role) {
        reject(`you are not the channel's member`);
      }
      resolve({
        user, channel, role: user_channel.role
      });
    } catch (error) {
      reject(error);
    }
  });
