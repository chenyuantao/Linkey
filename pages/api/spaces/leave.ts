import { NextApiHandler } from 'next';
import { query } from '../../../lib/db';
import { formatSuccessResponse, formatFailedResponse } from '@/lib/utils';
import { MEMBER_ROLE } from '@/lib/typings';
import authSpaceMiddleware from '@/lib/middlewares/auth-space-middleware';

const handler: NextApiHandler = async (req, res) => {
  try {
    const { user, space, role } = await authSpaceMiddleware(req, res);
    await query(`UPDATE users_spaces SET status = 0 WHERE user_id = ? AND space_id = ?`, [user.id, space.id]);
    if (role === MEMBER_ROLE.OWNER) {
      // 拥有者离开space，则将整个space也删除
      await query(`UPDATE spaces SET status = 0 WHERE id = ?`, [space.id]);
    }
    return res.json(formatSuccessResponse(null));
  } catch (e) {
    res.json(formatFailedResponse(e.message))
  }
};

export default handler;
