import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../db';
import { CHANNEL_PRIVACY } from '../typings';

export type ChannelResponse = {
  id: number;
  name: string;
  space_id: number;
  privacy: CHANNEL_PRIVACY;
  latest_msg_id: number;
};

export default (req: NextApiRequest, res: NextApiResponse) =>
  new Promise<ChannelResponse>(async (resolve, reject) => {
    const { channel_id } = req.body;
    if (!channel_id) {
      reject({ message: '`channel_id` is required' });
    }
    const [channel] = await query(
      `SELECT \`id\`,\`name\`,\`space_id\`,\`privacy\`,\`latest_msg_id\` FROM channels WHERE id = ? and status = 1`,
      [channel_id],
    );
    if (!channel?.id) {
      reject({ message: 'invalid channel' });
    }
    resolve(channel);
  });
