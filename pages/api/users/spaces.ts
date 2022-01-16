import { NextApiHandler } from 'next';
import { formatFailedResponse, formatSuccessResponse } from '@/lib/utils';
import authMiddleware from '@/lib/middlewares/auth-middleware';
import { query } from '@/lib/db';

const handler: NextApiHandler = async (req, res) => {
  try {
    const { id: user_id } = await authMiddleware(req, res);
    const rows = await query(
      `
    SELECT
      s.id,
      s.name,
      s.avatar_id,
      s.permission,
      s.desc,
      us.join_time,
      us.role
    FROM
      users_spaces us
    INNER JOIN spaces s ON us.space_id = s.id
      AND us.status = 1
    WHERE
      us.status = 1
      AND us.user_id = ?
    ORDER BY join_time DESC
    `,
      [user_id],
    );
    return res.json(formatSuccessResponse(rows));
  } catch (e) {
    res.json(formatFailedResponse(e.message));
  }
};

export default handler;
