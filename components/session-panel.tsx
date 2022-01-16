import { useState, useEffect } from 'react';
import { useApp } from '@/lib/AppContext';
import styled from 'styled-components';
import AddIcon from '@mui/icons-material/Add';
import ChannelModal from './channel-modal';
import { useChannels } from '@/lib/swr-hooks';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ColorHash from 'color-hash';
import moment from 'moment';

const colorHash = new ColorHash();

const SessionPanelWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 300px;
  width: 300px;
  max-width: 300px;
  height: 100%;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  border-right: 1px solid rgba(0, 0, 0, 0.1);
  background: white;
  box-sizing: border-box;
`;

const SearchTop = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  .input {
    flex: 1;
    background: #eaeaea;
    padding: 0 8px;
    font-size: 14px;
    border-radius: 3px;
    margin-right: 16px;
    height: 24px;
    color: #666;
  }
  .icon {
    cursor: pointer;
    background: #eaeaea;
    border-radius: 3px;
    color: #666;
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: 500;
  margin-right: 16px;
  flex-shrink: 0;
`;

const ChannelTitle = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  .name {
    color: #111;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    margin-right: 4px;
    flex: 1;
  }
  .time {
    font-size: 10px;
    color: #888;
    flex-shrink: 0;
  }
`;

const ChannelContent = styled.div`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: inline-block;
  max-width: calc(300px - 88px);
`;

export default function SessionPanel({}) {
  const { user, channel, setChannel, space } = useApp();
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const { data } = useChannels(space.id);
  const channels = (data?.data?.data || []).filter((f) => (searchValue ? f.channel_name.includes(searchValue) : true));

  useEffect(() => {
    if (space?.id) {
      setChannel(null);
    }
  }, [space?.id]);

  return (
    <SessionPanelWrapper>
      {showChannelModal && <ChannelModal open={showChannelModal} setOpen={(o) => setShowChannelModal(o)} />}
      <SearchTop>
        <input
          className="input"
          placeholder="Search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <AddIcon className="icon" onClick={() => setShowChannelModal(true)} />
      </SearchTop>
      <List>
        {channels.map((c) => (
          <ListItem
            key={String(c.channel_id)}
            disablePadding
            style={
              channel?.channel_id === c.channel_id
                ? { background: '#DEDEDE', overflow: 'hidden' }
                : { overflow: 'hidden' }
            }
            onClick={() => setChannel(c)}
          >
            <ListItemButton>
              <Avatar style={{ background: colorHash.hex(c.channel_id + c.channel_name) }}>
                {c.channel_name.substring(0, 1)}
              </Avatar>
              <ListItemText
                primary={
                  <ChannelTitle>
                    <span className="name">{c.channel_name}</span>
                    <span className="time">
                      {moment(c.latest_reply_time || c.join_time || c.channel_create_time).fromNow()}
                    </span>
                  </ChannelTitle>
                }
                secondary={
                  <ChannelContent>
                    {c.latest_reply_content
                      ? `${c.latest_reply_user_id === user.id ? 'Me' : c.latest_reply_user_nickname}: ${
                          c.latest_reply_content
                        }`
                      : '\u200b'}
                  </ChannelContent>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </SessionPanelWrapper>
  );
}
