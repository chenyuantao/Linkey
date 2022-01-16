import { NextApiHandler } from 'next';
import { formatSuccessResponse, formatFailedResponse } from '@/lib/utils';
import authMiddleware from '@/lib/middlewares/auth-middleware';

const handler: NextApiHandler = async (req, res) => {
  try {
    const profile = await authMiddleware(req, res);
    return res.json(formatSuccessResponse(profile));
  } catch (e) {
    res.json(formatFailedResponse(e.message));
  }
};

export default handler;
