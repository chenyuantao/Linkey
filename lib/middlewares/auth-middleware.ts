import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../db';

export type AuthResponse = {
  id: number;
  nickname: string;
  avatar_id: string;
};

export default (req: NextApiRequest, res: NextApiResponse) =>
  new Promise<AuthResponse>(async (resolve, reject) => {
    const access_token = req.cookies.access_token || req.body.access_token;
    if (!access_token) {
      reject({ message: 'auth failed: no token' });
    }
    const [data] = await query(
      `
      SELECT
        id,
        nickname,
        avatar_id
      FROM
        users
      WHERE
        access_token = ?
        AND status = 1
    `,
      [access_token],
    );
    if (!data || !data.id) {
      return reject({ message: 'auth failed: wrong token' });
    }
    const { id, nickname, avatar_id } = data;
    resolve({ id, nickname, avatar_id });
  });
