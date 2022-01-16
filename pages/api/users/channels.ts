import { NextApiHandler } from 'next';
import { formatFailedResponse, formatSuccessResponse } from '@/lib/utils';
import { query } from '@/lib/db';
import authSpaceMiddleware from '@/lib/middlewares/auth-space-middleware';

const handler: NextApiHandler = async (req, res) => {
  try {
    const { user, space } = await authSpaceMiddleware(req, res);
    const rows = await query(
      `
    SELECT
      c.id as channel_id,
      c.name as channel_name,
      c.privacy as channel_privacy,
      c.create_time as channel_create_time,
      m.create_time as latest_reply_time,
      m.content as latest_reply_content,
      u.id as latest_reply_user_id,
      u.nickname as latest_reply_user_nickname,
      uc.join_time,
      uc.role,
      uc.is_top
    FROM
      users_channels uc
    INNER JOIN channels c ON uc.channel_id = c.id
      AND uc.status = 1
    LEFT JOIN messages m ON c.latest_msg_id = m.id
    LEFT JOIN users u ON m.user_id = u.id
    WHERE
      uc.status = 1
      AND uc.user_id = ?
      AND c.space_id = ?
    ORDER BY
      uc.is_top DESC,
      m.create_time DESC,
      uc.join_time DESC,
      c.create_time DESC
    `,
      [user.id, space.id],
    );
    return res.json(formatSuccessResponse(rows));
  } catch (e) {
    res.json(formatFailedResponse(e.message));
  }
};

export default handler;
