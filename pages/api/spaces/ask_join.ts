import { NextApiHandler } from 'next';
import { formatSuccessResponse, formatFailedResponse } from '@/lib/utils';
import authMiddleware from '@/lib/middlewares/auth-middleware';
import { query } from '@/lib/db';
import { MEMBER_ROLE, SPACE_PERMISSION } from '@/lib/typings';
import spaceMiddleware from '@/lib/middlewares/space-middleware';

const handler: NextApiHandler = async (req, res) => {
  try {
    const space = await spaceMiddleware(req, res);
    const { id: user_id } = await authMiddleware(req, res);
    // 再校验用户是否已经在space里，如果是则不需要二次加入了
    const [row] = await query(
      `
    SELECT
      id,
      status
    FROM
      users_spaces
    WHERE
      user_id = ?
      AND space_id = ?
    `,
      [user_id, space.id],
    );
    if (row?.status === 1) {
      return res.json(formatFailedResponse("you are alraedy the space's member"))
    }
    // 私密类型的space必须通过scode加入
    if (space.permission === SPACE_PERMISSION.PRIVATE && !req.body.scode) {
      return res.json(formatFailedResponse('you cannot join the space without scode'))
    }
    if (row?.id) {
      // 用户曾经加入过，直接更新原记录，退出后再进入，身份应该重置为普通成员
      await query(`UPDATE users_spaces SET status = 1,join_time = FROM_UNIXTIME(?),role = ? WHERE id = ?`, [
        Date.now(),
        MEMBER_ROLE.NORMAL,
        row?.id,
      ]);
    } else {
      // 插入新记录，默认为普通成员身份
      await query(`INSERT INTO users_spaces (\`user_id\`, \`space_id\`, \`role\`) VALUES (?,?,?);`, [
        user_id,
        space.id,
        MEMBER_ROLE.NORMAL,
      ]);
    }
    return res.json(formatSuccessResponse(null));
  } catch (e) {
    res.json(formatFailedResponse(e.message))
  }
};

export default handler;
