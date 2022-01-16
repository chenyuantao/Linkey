import { NextApiHandler } from 'next';
import { formatSuccessResponse, formatFailedResponse } from '@/lib/utils';
import { MEMBER_ROLE } from '@/lib/typings';
import authChannelMiddleware from '@/lib/middlewares/auth-channel-middleware';
import { query } from '@/lib/db';

const handler: NextApiHandler = async (req, res) => {
  try {
    const { channel, role } = await authChannelMiddleware(req, res);
    const userIds = (
      await query(`SELECT user_id FROM users_channels WHERE channel_id = ? AND status = 1`, [channel.id])
    ).map((u) => u.user_id);
    const can_invite_users = await query(
      `
      SELECT u.id,u.nickname,u.avatar_id
      FROM users_spaces us 
      INNER JOIN users u ON us.user_id = u.id 
      WHERE us.space_id = ? AND us.status = 1 AND us.user_id NOT IN (?)
    `,
      [channel.space_id, userIds],
    );
    return res.json(
      formatSuccessResponse({
        ...channel,
        role: role || MEMBER_ROLE.NONE,
        can_invite_users,
      }),
    );
  } catch (e) {
    res.json(formatFailedResponse(e.message));
  }
};

export default handler;
