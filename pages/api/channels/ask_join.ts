import { NextApiHandler } from 'next';
import { formatFailedResponse, formatSuccessResponse } from '@/lib/utils';
import authMiddleware from '@/lib/middlewares/auth-middleware';
import { query } from '@/lib/db';
import { CHANNEL_PRIVACY, MEMBER_ROLE } from '@/lib/typings';
import channelMiddleware from '@/lib/middlewares/channel-middleware';

const handler: NextApiHandler = async (req, res) => {
  try {
    const channel = await channelMiddleware(req, res);
    const user = await authMiddleware(req, res);
    // 再校验用户是否已经在channel里，如果是则不需要二次加入了
    const [row] = await query(
      `
    SELECT
      id,
      status
    FROM
      users_channels
    WHERE
      user_id = ?
      AND channel_id = ?
    `,
      [user.id, channel.id],
    );
    if (row?.status === 1) {
      return res.json(formatFailedResponse("you are alraedy the channel's member"))
    }
    // 私密类型的channel必须主动邀请
    if (channel.privacy === CHANNEL_PRIVACY.PRIVATE) {
      return res.json(formatFailedResponse('you cannot join the channel without invite'))
    }
    if (row?.id) {
      // 用户曾经加入过，直接更新原记录，退出后再进入，身份应该重置为普通成员
      await query(`UPDATE users_channels SET status = 1,join_time = FROM_UNIXTIME(?),role = ? WHERE id = ?`, [
        Date.now(),
        MEMBER_ROLE.NORMAL,
        row?.id,
      ]);
    } else {
      // 插入新记录，默认为普通成员身份
      await query(`INSERT INTO users_channels (\`user_id\`, \`channel_id\`, \`role\`) VALUES (?,?,?);`, [
        user.id,
        channel.id,
        MEMBER_ROLE.NORMAL,
      ]);
    }
    return res.json(formatSuccessResponse(null));
  } catch (e) {
    res.json(formatFailedResponse(e.message))
  }
};

export default handler;
