import { NextApiHandler } from 'next';
import { formatSuccessResponse, formatFailedResponse, val } from '@/lib/utils';
import { query, db } from '@/lib/db';
import { CHANNEL_PRIVACY, MEMBER_ROLE } from '@/lib/typings';
import authSpaceMiddleware from '@/lib/middlewares/auth-space-middleware';

const handler: NextApiHandler = async (req, res) => {
  try {
    // 获取参数
    const { name, space_id, privacy = CHANNEL_PRIVACY.PUBLIC_AUTO } = req.body;
    if (!name || !space_id) {
      return res.json(formatFailedResponse('`name` and `space_id` are both required'))
    }
    const { user } = await authSpaceMiddleware(req, res);
    // 判断是否已经存在同名的channel
    const [row] = await query(`SELECT id FROM channels WHERE space_id = ? AND name = ? AND status = 1`, [space_id, name]);
    if (!!row?.id) {
      return res.json(formatFailedResponse('cannot create the same name channel'))
    }
    let channelId;
    await db
      .transaction()
      .query(
        `
        INSERT INTO channels (\`name\`, \`space_id\`, \`privacy\`)
        VALUES (${val(name)}, ${val(space_id)}, ${val(privacy)})
        `,
      )
      .query(({ insertId: channel_id }) => {
        if (!channel_id) {
          throw new Error('create failed');
        }
        channelId = channel_id;
        return [
          `
        INSERT INTO users_channels (user_id, channel_id, \`role\`)
        VALUES (?, ?, ?);
        `,
          [user.id, channel_id, MEMBER_ROLE.OWNER],
        ];
      })
      .commit();
    return res.json(
      formatSuccessResponse({
        name,
        space_id,
        privacy,
        channel_id: channelId,
      }),
    );
  } catch (e) {
    res.json(formatFailedResponse(e.message))
  }
};

export default handler;
