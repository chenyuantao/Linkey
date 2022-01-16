import { NextApiHandler } from 'next';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../../../lib/db';
import authMiddleware from '@/lib/middlewares/auth-middleware';
import { MEMBER_ROLE } from '@/lib/typings';
import { formatSuccessResponse, formatFailedResponse } from '@/lib/utils';

const handler: NextApiHandler = async (req, res) => {
  // 提取参数
  const { space_id } = req.body;
  try {
    // 参数校验
    if (!space_id) {
      return res.json(formatFailedResponse('`space_id` is required'))
    }
    const { id: user_id } = await authMiddleware(req, res);
    const [row] = await query(
      `
    SELECT
      us.role
    FROM
      users_spaces us
    INNER JOIN spaces s ON us.space_id = s.id
      AND us.status = 1
    WHERE 
      us.user_id = ?
      AND us.space_id = ?
    `,
      [user_id, space_id],
    );
    if (row?.role !== MEMBER_ROLE.OWNER) {
      return res.json(formatFailedResponse("your are not the space's owner"))
    }
    // 创建14位的随机sharecode，字符串太长用户不愿意打开
    const scode = uuidv4().replace(/-/g, '').substring(0, 14);
    await query(
      `
    UPDATE
      spaces
    SET
      share_code = ?
    WHERE
      id = ?;
    `,
      [scode, space_id],
    );
    return res.json(formatSuccessResponse({ scode, space_id }));
  } catch (e) {
    // 返回报错给用户
    res.json(formatFailedResponse(e.message))
  }
};

export default handler;
