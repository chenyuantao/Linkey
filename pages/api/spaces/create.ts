import { NextApiHandler } from 'next';
import { formatFailedResponse, formatSuccessResponse, val } from '@/lib/utils';
import authMiddleware from '@/lib/middlewares/auth-middleware';
import { query, db } from '@/lib/db';
import { MEMBER_ROLE } from '@/lib/typings';

const handler: NextApiHandler = async (req, res) => {
  try {
    // 获取参数
    const { name, desc, avatar_id, permission = 1 } = req.body;
    /** 
     * 省略一堆校验代码
     * name 长度校验/字符串校验
     * permission 数值区间校验(1,2,3)
     */
    const { id: user_id } = await authMiddleware(req, res);

    const [data] = await query(
      `
    SELECT
      COUNT(us.id) AS total
    FROM
      users_spaces us
      INNER JOIN spaces s ON us.space_id = s.id
        AND s.status = 1
    WHERE
      us.status = 1
      AND us.role = 1
      AND us.user_id = ?
    `,
      [user_id],
    );
    const total = data?.total || 0;
    // 判断拥有的空间数是否大于等于5
    if (total >= 5) {
      return res.json(formatFailedResponse('owner spaces is full'));
    }
    // 插入数据
    let spaceid;
    await db
      .transaction()
      .query(
        `
        INSERT INTO spaces (\`name\`, \`desc\`, \`avatar_id\`, \`permission\`)
        VALUES (${val(name)}, ${val(desc)}, ${val(avatar_id)}, ${val(permission)})
        `,
      )
      .query(({ insertId: space_id }) => {
        if (!space_id) {
          throw new Error('create failed');
        }
        spaceid = space_id;
        return [
          `
        INSERT INTO users_spaces (user_id, space_id, \`role\`)
        VALUES (?, ?, ?);
        `,
          [user_id, space_id, MEMBER_ROLE.OWNER],
        ];
      })
      .commit();
    return res.json(
      formatSuccessResponse({
        name,
        desc,
        avatar_id,
        permission,
        space_id: spaceid,
      }),
    );
  } catch (e) {
    res.json(formatFailedResponse(e.message))
  }
};

export default handler;
