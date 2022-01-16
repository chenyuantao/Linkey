import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../db';
import { SPACE_PERMISSION } from '../typings';

export type SpaceResponse = {
  id: number;
  share_code: string;
  name: string;
  desc: string;
  avatar_id: string;
  permission: SPACE_PERMISSION;
};

export default (req: NextApiRequest, res: NextApiResponse) =>
  new Promise<SpaceResponse>(async (resolve, reject) => {
    const { space_id, scode } = req.body;
    if (!space_id && !scode) {
      reject({ message: '`space_id` or `scode` is required' });
    }
    const [space] = await query(
      `SELECT \`id\`,\`share_code\`,\`name\`,\`desc\`,\`permission\`,\`avatar_id\` FROM spaces WHERE (id = ? or share_code = ?) and status = 1`,
      [space_id, scode],
    );
    if (!space?.id) {
      reject({ message: 'invalid space' });
    }
    resolve(space);
  });
