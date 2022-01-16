import { NextApiHandler } from 'next';
import { formatSuccessResponse, formatFailedResponse } from '@/lib/utils';
import authMiddleware from '@/lib/middlewares/auth-middleware';
import spaceMiddleware from '@/lib/middlewares/space-middleware';
import { query } from '@/lib/db';
import { MEMBER_ROLE } from '@/lib/typings';

const handler: NextApiHandler = async (req, res) => {
  try {
    const space = await spaceMiddleware(req, res);
    const { id: user_id } = await authMiddleware(req, res);
    const [row] = await query(
      `
    SELECT
      role
    FROM
      users_spaces
    WHERE
      user_id = ?
      AND space_id = ?
      AND status = 1
    `,
      [user_id, space.id],
    );
    return res.json(
      formatSuccessResponse({
        ...space,
        role: row?.role || MEMBER_ROLE.NONE,
      }),
    );
  } catch (e) {
    res.json(formatFailedResponse(e.message))
  }
};

export default handler;
