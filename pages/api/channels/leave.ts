import { NextApiHandler } from 'next';
import { query } from '../../../lib/db';
import { formatSuccessResponse, formatFailedResponse } from '@/lib/utils';
import { MEMBER_ROLE } from '@/lib/typings';
import authChannelMiddleware from '@/lib/middlewares/auth-channel-middleware';

const handler: NextApiHandler = async (req, res) => {
  try {
    const { user, channel, role } = await authChannelMiddleware(req, res);
    await query(`UPDATE users_channels SET status = 0 WHERE user_id = ? AND channel_id = ?`, [user.id, channel.id]);
    if (role === MEMBER_ROLE.OWNER) {
      // 拥有者离开channel，则将整个channel也删除
      await query(`UPDATE channels SET status = 0 WHERE id = ?`, [channel.id]);
    }
    return res.json(formatSuccessResponse(null));
  } catch (e) {
    res.json(formatFailedResponse(e.message))
  }
};

export default handler;
