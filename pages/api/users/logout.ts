import { NextApiHandler } from 'next';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../../../lib/db';
import { formatSuccessResponse, formatFailedResponse } from '@/lib/utils';
import authMiddleware from '@/lib/middlewares/auth-middleware';

const handler: NextApiHandler = async (req, res) => {
  try {
    const { id } = await authMiddleware(req, res);
    await query(`UPDATE users SET access_token = ? WHERE id = ?`, [uuidv4(), id]);
    return res.json(formatSuccessResponse(null));
  } catch (e) {
    res.json(formatFailedResponse(e.message));
  }
};

export default handler;
