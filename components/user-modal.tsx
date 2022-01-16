import { useState } from 'react';
import { useSWRConfig } from 'swr';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Checkbox from '@mui/material/Checkbox';
import axios from 'axios';
import * as _ from 'lodash';
import { getAvatarFromData } from '@fractalsoftware/random-avatar-generator';

import { useRouter } from 'next/router';
import { useApp } from '@/lib/AppContext';
import { useChannelUsers } from '@/lib/swr-hooks';
import { SvgAvatar } from './styled';

export default function ChannelModal({ open, setOpen }: any) {
  const { mutate } = useSWRConfig();
  const { showToast, channel } = useApp();
  const { data } = useChannelUsers(channel?.channel_id);
  const users = data?.data?.data?.can_invite_users || [];
  const [selectedIds, setSelectedIds] = useState([]);

  const handleClose = (event, reason) => {
    if (reason !== 'backdropClick') {
      setOpen(false);
    }
  };

  return (
    <div>
      <Dialog disableEscapeKeyDown open={open} onClose={handleClose}>
        <DialogTitle>Choose Other Space Members</DialogTitle>
        <DialogContent>
          <List dense sx={{ width: '100%' }}>
            {users.length === 0
              ? 'Dont have available space member'
              : users.map((u) => {
                  const toggle = () => {
                    const isChecked = selectedIds.indexOf(u.id) !== -1;
                    if (!isChecked) {
                      setSelectedIds((ids) => [...ids, u.id]);
                    } else {
                      setSelectedIds((ids) => {
                        const l = [...ids];
                        _.remove(l, (i) => i === u.id);
                        return l;
                      });
                    }
                  };
                  return (
                    <ListItem
                      onClick={toggle}
                      key={String(u.id)}
                      secondaryAction={
                        <Checkbox edge="end" onChange={toggle} checked={selectedIds.indexOf(u.id) !== -1} />
                      }
                      disablePadding
                    >
                      <ListItemButton>
                        <ListItemAvatar>
                          <SvgAvatar
                            dangerouslySetInnerHTML={{
                              __html: getAvatarFromData(u?.avatar_id),
                            }}
                          />
                        </ListItemAvatar>
                        <ListItemText primary={u.nickname} />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>CLOSE</Button>
          <Button
            variant="contained"
            disabled={selectedIds.length === 0}
            onClick={async () => {
              const { data: inviteRes } = await axios.post('/api/channels/invite', {
                channel_id: channel.channel_id,
                user_ids: selectedIds,
              });
              if (inviteRes.code !== 0) {
                return;
              }
              mutate(`/api/channels/info?channel_id=${channel.channel_id}`);
              setOpen(false);
              showToast({
                severity: 'success',
                message: 'invited',
              });
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
