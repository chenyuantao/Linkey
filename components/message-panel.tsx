import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/lib/AppContext';
import { useChannelInfo, useMessages } from '@/lib/swr-hooks';
import styled from 'styled-components';
import axios from 'axios';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { getAvatarFromData } from '@fractalsoftware/random-avatar-generator';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Typography from '@mui/material/Typography';
import MoreHoriz from '@mui/icons-material/MoreHoriz';
import moment from 'moment';
import * as _ from 'lodash';
import MenuWrapper from './menu-wrapper';
import UserModal from './user-modal';
import { SvgAvatar } from './styled';

const MessagePanelWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #f3f3f3;
`;

const MessageTitleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  width: 100%;
  height: 58px;
  min-height: 58px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  flex-shrink: 0;

  > svg {
    width: 24px;
    height: 24px;
    cursor: pointer;
  }
`;

const MessageListWrapper = styled.div`
  flex: 1;
  overflow-y: scroll;
  overflow-x: hidden;
`;

const SenderTitle = styled.div`
  .name {
    font-weight: 900;
    color: #111;
    font-size: 15px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    margin-right: 7px;
  }
  .time {
    font-size: 12px;
    color: #888;
    flex-shrink: 0;
  }
`;

const MessageInputWrapper = styled.div`
  flex-shrink: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  height: 120px;
  min-height: 120px;
  > textarea {
    width: 100%;
    height: 100%;
    padding: 16px;
    border: none;
    overflow: auto;
    outline: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
    box-shadow: none;
    resize: none;
  }
`;

export default function MessagePanel({}) {
  const listRef = useRef(null);
  const textRef = useRef(null);
  const { user, channel, showToast, localMsg: _localMsg } = useApp();
  const ref = useRef(false);
  const { data: channelData } = useChannelInfo(channel.channel_id);
  const { data: messageData } = useMessages(channel.channel_id);
  const [input, setInput] = useState('');
  const [userModal, setUserModal] = useState(false);
  const count = channelData?.data?.data?.count || 0;
  const localMsg = _localMsg.filter((l) => l.channel_id === channel?.channel_id);
  const messages = [...localMsg, ...(messageData?.data?.data?.messages || [])];
  const users = messageData?.data?.data?.users || [];
  const scrollToBottom = () => listRef?.current?.scrollTo(0, listRef?.current?.scrollHeight || 0);
  useEffect(() => {
    if (localMsg?.[0]?.user_id === user.id) {
      scrollToBottom();
    }
  }, [localMsg]);
  useEffect(() => {
    if (messages?.length && channel.channel_id) {
      scrollToBottom();
    }
  }, [!!messages?.length, channel.channel_id]);
  const sendMsg = async () => {
    if (ref?.current || !input) {
      return;
    }
    setInput('');
    ref.current = true;
    const { data: sendRes } = await axios.post('/api/messages/publish', {
      content: input,
      channel_id: channel.channel_id,
    });
    ref.current = false;
    if (sendRes.code !== 0) {
      return;
    }
    scrollToBottom();
  };
  useEffect(() => {
    if (channel?.channel_id && textRef?.current) {
      textRef.current.focus();
    }
  }, [channel?.channel_id]);
  return (
    <MessagePanelWrapper>
      {userModal && <UserModal open={userModal} setOpen={(o) => setUserModal(o)} />}
      <MessageTitleWrapper>
        <span>{`${channel.channel_name} ${count ? `(${count})` : ''}`}</span>
        <MenuWrapper
          list={[
            {
              title: 'Invite',
              onClick: () => setUserModal(true),
            },
            {
              title: 'Leave',
              onClick: async () => {
                const { data: leaveRes } = await axios.post('/api/channels/leave', { channel_id: channel.channel_id });
                if (leaveRes.code !== 0) {
                  return;
                }
                showToast({
                  severity: 'info',
                  message: 'leaved',
                });
              },
            },
          ]}
        >
          <MoreHoriz />
        </MenuWrapper>
      </MessageTitleWrapper>
      <MessageListWrapper ref={listRef}>
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {_.uniqBy(messages, (m) => m.id)
            .sort((a, b) => a.id - b.id)
            .map((m) => {
              const u = users.find((u) => u.id === m.user_id);
              return (
                <ListItem key={String(m.id)} alignItems="flex-start">
                  <ListItemAvatar>
                    {!!u?.avatar_id && (
                      <SvgAvatar
                        dangerouslySetInnerHTML={{
                          __html: getAvatarFromData(u.avatar_id),
                        }}
                      />
                    )}
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <SenderTitle>
                        <span className="name">{u?.nickname}</span>
                        <span className="time">{moment(m.create_time).fromNow()}</span>
                      </SenderTitle>
                    }
                    secondary={
                      <Typography sx={{ display: 'inline' }} component="span" variant="body2" color="text.primary">
                        {m.content}
                      </Typography>
                    }
                  />
                </ListItem>
              );
            })}
        </List>
      </MessageListWrapper>
      <MessageInputWrapper>
        <textarea
          ref={textRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (e.metaKey) {
                e.preventDefault();
                setInput((i) => i + '\n');
              } else {
                e.preventDefault();
                sendMsg();
              }
              return;
            }
          }}
        />
      </MessageInputWrapper>
    </MessagePanelWrapper>
  );
}
