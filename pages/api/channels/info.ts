import { NextApiHandler } from 'next';
import { formatSuccessResponse, formatFailedResponse } from '@/lib/utils';
import { MEMBER_ROLE } from '@/lib/typings';
import authChannelMiddleware from '@/lib/middlewares/auth-channel-middleware';
import { query } from '@/lib/db';

const handler: NextApiHandler = async (req, res) => {
  try {
    const { channel, role } = await authChannelMiddleware(req, res);
    const [row] = await query(`SELECT count(1) as cnt FROM users_channels WHERE channel_id = ? AND status = 1`, [
      channel.id,
    ]);
    return res.json(
      formatSuccessResponse({
        ...channel,
        role: role || MEMBER_ROLE.NONE,
        count: row?.cnt || 0,
      }),
    );
  } catch (e) {
    res.json(formatFailedResponse(e.message));
  }
};

export default handler;
