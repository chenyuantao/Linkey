import { NextApiHandler } from 'next';
import { buildColumns, formatFailedResponse, formatSuccessResponse } from '@/lib/utils';
import { query } from '@/lib/db';
import authSpaceMiddleware from '@/lib/middlewares/auth-space-middleware';
import { MANAGER_ROLES } from '@/lib/typings';

const handler: NextApiHandler = async (req, res) => {
  try {
    const { space, role } = await authSpaceMiddleware(req, res);
    if (!MANAGER_ROLES.includes(role)) {
      return res.json(formatFailedResponse("you are not the space's manager"));
    }
    const { name, desc, avatar_id, permission } = req.body;
    const updateColums = { name, desc, avatar_id, permission };
    await query(
      `
    UPDATE
      spaces
    SET
      ${buildColumns(updateColums)}
    WHERE
      id = ?
    `,
      [space.id],
    );
    return res.json(formatSuccessResponse({ ...updateColums, space_id: space.id }));
  } catch (e) {
    res.json(formatFailedResponse(e.message));
  }
};

export default handler;
