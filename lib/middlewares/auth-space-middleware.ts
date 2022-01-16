import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../db';
import { MEMBER_ROLE } from '../typings';
import authMiddleware, { AuthResponse } from './auth-middleware';
import spaceMiddleware, { SpaceResponse } from './space-middleware';

export type AuthSpaceResponse = { user: AuthResponse; space: SpaceResponse; role: MEMBER_ROLE };

export default (req: NextApiRequest, res: NextApiResponse) =>
  new Promise<AuthSpaceResponse>(async (resolve, reject) => {
    try {
      const user = await authMiddleware(req, res);
      const space = await spaceMiddleware(req, res);
      const [user_space] = await query(`SELECT role FROM users_spaces WHERE user_id = ? AND space_id = ? AND status = 1`, [user.id, space.id]);
      if (!user_space?.role) {
        reject(`you are not the space's member`);
      }
      resolve({
        user, space, role: user_space.role
      });
    } catch (error) {
      reject(error);
    }
  });
