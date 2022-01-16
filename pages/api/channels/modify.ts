import { NextApiHandler } from 'next';
import { buildColumns, formatFailedResponse, formatSuccessResponse } from '@/lib/utils';
import { query } from '@/lib/db';
import { MANAGER_ROLES } from '@/lib/typings';
import authChannelMiddleware from '@/lib/middlewares/auth-channel-middleware';

const handler: NextApiHandler = async (req, res) => {
  try {
    const { role, channel } = await authChannelMiddleware(req, res);
    if (!MANAGER_ROLES.includes(role)) {
      return res.json(formatFailedResponse("you are not the channel's manager"));
    }
    const { privacy } = req.body;
    const updateColums = { privacy };
    await query(
      `
    UPDATE
      channels
    SET
      ${buildColumns(updateColums)}
    WHERE
      id = ?
    `,
      [channel.id],
    );
    return res.json(formatSuccessResponse({ ...updateColums, channel_id: channel.id }));
  } catch (e) {
    res.json(formatFailedResponse(e.message))
  }
};

export default handler;
