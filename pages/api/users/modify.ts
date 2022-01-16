import { NextApiHandler } from 'next';
import { query } from '../../../lib/db';
import { buildColumns, formatSuccessResponse, formatFailedResponse } from '@/lib/utils';
import authMiddleware from '@/lib/middlewares/auth-middleware';

const handler: NextApiHandler = async (req, res) => {
  // 提取参数
  const { nickname, avatar_id } = req.body;
  try {
    // 鉴权
    const { id } = await authMiddleware(req, res);
    // 对参数校验
    if (!(nickname || avatar_id)) {
      return res.json(formatFailedResponse('no modify'));
    }
    // 执行SQL
    await query(
      `
      UPDATE
        users
      SET
        ${buildColumns({ nickname, avatar_id })}
      WHERE
        id = ?
    `,
      [id],
    );
    // 返回执行结果给用户
    return res.json(formatSuccessResponse({ nickname, avatar_id }));
  } catch (e) {
    res.json(formatFailedResponse(e.message));
  }
};

export default handler;
