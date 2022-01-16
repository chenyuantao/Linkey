import { NextApiHandler } from 'next';
import { formatFailedResponse, formatSuccessResponse } from '@/lib/utils';
import { query } from '@/lib/db';
import { ROW_STATUS, MANAGER_ROLES, MEMBER_ROLE } from '@/lib/typings';
import authChannelMiddleware from '@/lib/middlewares/auth-channel-middleware';

const handler: NextApiHandler = async (req, res) => {
  try {
    const { user_ids } = req.body;
    if (!user_ids?.length) {
      return res.json(formatFailedResponse('`user_ids` is required'));
    }
    const { role, channel } = await authChannelMiddleware(req, res);
    if (!MANAGER_ROLES.includes(role)) {
      return res.json(formatFailedResponse('only manager can invite member'));
    }
    // TODO: 检查user_ids数组的合法性（是否为channel的成员？）
    await query(`
      INSERT INTO users_channels (\`user_id\`,\`channel_id\`,\`role\`,\`status\`)
      VALUES ${user_ids.map((uid) => `(${uid},${channel.id},${MEMBER_ROLE.NORMAL},${ROW_STATUS.EXIST})`)}
      ON DUPLICATE KEY UPDATE \`status\` = VALUES(\`status\`);
    `);
    return res.json(formatSuccessResponse(null));
  } catch (e) {
    res.json(formatFailedResponse(e.message));
  }
};

export default handler;
