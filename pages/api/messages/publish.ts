import { NextApiHandler } from 'next';
import { formatFailedResponse, formatSuccessResponse } from '@/lib/utils';
import authChannelMiddleware from '@/lib/middlewares/auth-channel-middleware';
import { db } from '@/lib/db';
import moment from 'moment';
import Pusher from 'pusher';

const triggerEvent = (channel: string, event: string, data: any) => {
  const pusher = new Pusher({
    appId: '1332265',
    key: '10d92db2b99424dedc1d',
    secret: '4c26b186fb94a6f8e2ec',
    cluster: 'ap3',
    useTLS: true,
  });
  pusher.trigger(channel, event, data);
};

const handler: NextApiHandler = async (req, res) => {
  try {
    // 获取参数
    const { content, at_user_ids, parent_id } = req.body;
    if (!content) {
      return res.json(formatFailedResponse('`content` is required'));
    }
    const { user, channel } = await authChannelMiddleware(req, res);
    const atUserIds = at_user_ids || [];
    let msg_id;
    await db
      .transaction()
      .query(
        `INSERT INTO messages (\`channel_id\`, \`user_id\`, \`parent_id\`, \`content\`,\`at_user_ids\`)
        VALUES ( ?, ?, ?, ?, ?)`,
        [channel.id, user.id, parent_id, content, atUserIds.join(',')],
      )
      .query(({ insertId: _msg_id }) => {
        if (!_msg_id) {
          throw new Error('publish failed');
        }
        msg_id = _msg_id;
        return [`UPDATE channels SET latest_msg_id = ? WHERE id = ?`, [msg_id, channel.id]];
      })
      .commit();
    // 通知该房间的所有成员
    triggerEvent(`channel_${channel.id}`, 'new_channel_msg', {
      id: msg_id,
      content,
      at_user_ids,
      user_id: user.id,
      create_time: moment(),
      channel_id: channel.id,
    });
    return res.json(
      formatSuccessResponse({
        msg_id,
      }),
    );
  } catch (e) {
    res.json(formatFailedResponse(e.message));
  }
};

export default handler;
