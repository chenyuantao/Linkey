import { NextApiHandler } from 'next';
import { query } from '../../../lib/db';
import { serialize } from 'cookie';
import { formatFailedResponse, formatSuccessResponse, hashPassword } from '@/lib/utils';

const handler: NextApiHandler = async (req, res) => {
  // 提问参数
  const { phone, password } = req.body;
  try {
    // 参数校验
    if (!phone || !password) {
      return res.json(formatFailedResponse('`phone` and `password` are both required'));
    }
    // 查询出用户的数据
    const [data] = await query(
      `
      SELECT
        id,
        password,
        nickname,
        access_token,
        avatar_id,
        unix_timestamp(create_time) AS create_time
      FROM
        users
      WHERE
        phone = ?
        AND status = 1
    `,
      [phone],
    );
    // 有可能查不到用户数据
    if (!data?.id) {
      return res.json(formatFailedResponse('wrong phone'));
    }
    // 查询到了用户的数据
    const { password: encryptedPassword, create_time, nickname, avatar_id, access_token } = data;
    if (encryptedPassword !== hashPassword(password, create_time)) {
      return res.json(formatFailedResponse('wrong password'));
    }
    // 正确的密码，返回用户凭证
    res.setHeader('Set-Cookie', serialize('access_token', access_token, { path: '/' }));
    return res.json(
      formatSuccessResponse({
        nickname,
        access_token,
        avatar_id,
      }),
    );
  } catch (e) {
    res.json(formatFailedResponse(e.message));
  }
};

export default handler;
