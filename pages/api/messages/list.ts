import { NextApiHandler } from 'next';
import { formatFailedResponse, formatSuccessResponse } from '@/lib/utils';
import authChannelMiddleware from '@/lib/middlewares/auth-channel-middleware';
import { query } from '@/lib/db';

const handler: NextApiHandler = async (req, res) => {
  try {
    // 获取参数
    const { cursor_id, limit = 30 } = req.body;
    const { channel } = await authChannelMiddleware(req, res);
    const idSet = new Set();
    const messages = (
      await query(
        `
      SELECT
        id,
        content,
        at_user_ids,
        user_id,
        create_time
      FROM
        messages
      WHERE
        channel_id = ?
        AND status = 1
        AND parent_id IS NULL
        ${cursor_id ? `AND id < ${cursor_id}` : ''}
      ORDER BY id DESC
      LIMIT ${limit}
    `,
        [channel.id],
      )
    ).map((m) => {
      const atUserIds = (m.at_user_ids ? m.at_user_ids.split(',') : []).map(Number);
      idSet.add(m.user_id);
      atUserIds.forEach((id: string) => idSet.add(id));
      return { ...m, at_user_ids: atUserIds };
    });
    const userIds = Array.from(idSet);
    let users = [];
    if (userIds?.length) {
      users = await query(`SELECT id,nickname,avatar_id FROM users WHERE id in (${userIds.join(',')})`);
    }
    return res.json(
      formatSuccessResponse({
        messages,
        users,
      }),
    );
  } catch (e) {
    res.json(formatFailedResponse(e.message));
  }
};

export default handler;
