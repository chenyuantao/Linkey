import { NextApiHandler } from 'next';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../../../lib/db';
import { formatSuccessResponse, formatFailedResponse, hashPassword } from '@/lib/utils';
import moment from 'moment';
import { generateRandomAvatarData } from '@fractalsoftware/random-avatar-generator';

const handler: NextApiHandler = async (req, res) => {
  // 提取参数
  const { phone, password, nickname } = req.body;
  try {
    // 参数校验
    if (!phone || !password || !nickname) {
      return res.json(formatFailedResponse('`phone` , `password` and `nickname` are both required'));
    }
    // 生成凭证
    const access_token = uuidv4();
    // 加密算法
    const create_time = moment().unix();
    const pwd = hashPassword(password, create_time);
    // 生成随机头像
    const avatar_id = generateRandomAvatarData(8);
    // 执行SQL
    await query(
      `
      INSERT INTO users (phone, password, nickname, access_token, create_time, avatar_id)
      VALUES (?, ?, ?, ?, FROM_UNIXTIME(?), ?)
      `,
      [phone, pwd, nickname, access_token, create_time, avatar_id],
    );

    // 返回成功给用户
    return res.json(
      formatSuccessResponse({
        phone,
        nickname,
        access_token,
        avatar_id,
      }),
    );
  } catch (e) {
    // 返回报错给用户
    res.json(formatFailedResponse(e.message));
  }
};

export default handler;
