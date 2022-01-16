import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import InputLabel from '@mui/material/InputLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Input from '@mui/material/Input';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import DialogContentText from '@mui/material/DialogContentText';
import axios from 'axios';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Radio from '@mui/material/Radio';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useRouter } from 'next/router';
import { useApp } from '@/lib/AppContext';

export enum SpaceModalStatus {
  ASK = 0,
  CREATE = 1,
  JOIN = 2,
  LIST = 3,
}

export default function SpaceModal({ open, setOpen, status = SpaceModalStatus.ASK }: any) {
  const router = useRouter();
  const { showToast, spaces, space, setSpace } = useApp();
  const [cur, setCur] = useState<SpaceModalStatus>(status);
  const [scode, setScode] = useState('');
  const [spaceName, setSpaceName] = useState('');
  const [desc, setDesc] = useState('');
  const [joinSpaceName, setJoinSpaceName] = useState('');
  const hasNoSpace = !(spaces?.length > 0);
  const backToAsk = () => {
    setCur(SpaceModalStatus.ASK);
    setScode('');
    setSpaceName('');
    setDesc('');
    setJoinSpaceName('');
  };
  const handleClose = (event, reason) => {
    if (reason !== 'backdropClick') {
      setOpen(false);
    }
  };
  let content = null;
  switch (cur) {
    case SpaceModalStatus.ASK:
      content = (
        <>
          <DialogTitle>{hasNoSpace ? 'You Need To Join A Space First' : 'Join A New Space'}</DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ display: 'flex', flexWrap: 'wrap' }}>
              <FormControl fullWidth>
                <InputLabel htmlFor="my-input">Enter a space sharecode</InputLabel>
                <Input
                  id="my-input"
                  aria-describedby="my-helper-text"
                  onChange={(event) => setScode(event.target.value)}
                />
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            {!hasNoSpace && <Button onClick={() => setOpen(false)}>Close</Button>}
            <Button onClick={() => setCur(SpaceModalStatus.CREATE)}>Create My Own Space</Button>
            <Button
              variant="contained"
              disabled={!scode}
              onClick={async () => {
                const { data } = await axios.post('/api/spaces/info', {
                  scode,
                });
                if (data.code !== 0) {
                  return;
                }
                setJoinSpaceName(data.data.name);
                setCur(SpaceModalStatus.JOIN);
              }}
            >
              Join
            </Button>
          </DialogActions>
        </>
      );
      break;
    case SpaceModalStatus.CREATE:
      content = (
        <>
          <DialogTitle>Create My Own Space</DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ display: 'flex', flexWrap: 'wrap' }}>
              <FormControl fullWidth>
                <InputLabel htmlFor="my-input">Enter the space name</InputLabel>
                <Input id="my-input" onChange={(event) => setSpaceName(event.target.value)} />
                <TextField
                  style={{ marginTop: 16 }}
                  id="outlined-multiline-static"
                  label="Description(optional)"
                  multiline
                  rows={3}
                  value={desc}
                  onChange={(event) => setDesc(event.target.value)}
                />
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => backToAsk()}>BACK</Button>
            <Button
              variant="contained"
              disabled={!spaceName}
              onClick={async () => {
                const { data } = await axios.post('/api/spaces/create', {
                  name: spaceName,
                  desc,
                });
                if (data.code !== 0) {
                  return;
                }
                showToast({
                  severity: 'success',
                  message: 'space created',
                });
                router.replace('/');
              }}
            >
              OK
            </Button>
          </DialogActions>
        </>
      );
      break;
    case SpaceModalStatus.JOIN:
      content = (
        <>
          <DialogTitle>The Space You Join Is</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">{joinSpaceName}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => backToAsk()}>BACK</Button>
            <Button
              variant="contained"
              onClick={async () => {
                const { data } = await axios.post('/api/spaces/ask_join', {
                  scode,
                });
                if (data.code !== 0) {
                  return;
                }
                showToast({
                  severity: 'success',
                  message: 'space joined',
                });
                router.replace('/');
              }}
            >
              OK
            </Button>
          </DialogActions>
        </>
      );
      break;
    case SpaceModalStatus.LIST:
      content = (
        <>
          <DialogTitle>My Joined Spaces</DialogTitle>
          <DialogContent>
            <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
              {spaces.map((s) => (
                <ListItem
                  key={String(s.id)}
                  disablePadding
                  onClick={() => {
                    setSpace(s);
                    setOpen(false);
                  }}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={async (e) => {
                        e.stopPropagation();
                        const { data: leaveRes } = await axios.post('/api/spaces/leave', { space_id: s.id });
                        if (leaveRes.code !== 0) {
                          return;
                        }
                        setOpen(false);
                        router.replace('/');
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemButton>
                    <ListItemIcon>
                      <Radio checked={s.id === space?.id} style={{ padding: 0 }} />
                    </ListItemIcon>
                    <ListItemText primary={s.name} secondary={s.desc} />
                  </ListItemButton>
                </ListItem>
              ))}
              {spaces?.length <= 5 && (
                <ListItem disablePadding onClick={() => backToAsk()}>
                  <ListItemButton>
                    <ListItemIcon>
                      <AddCircleOutlineIcon />
                    </ListItemIcon>
                    <ListItemText primary={'Add space'} />
                  </ListItemButton>
                </ListItem>
              )}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>CLOSE</Button>
          </DialogActions>
        </>
      );
      break;
  }
  return (
    <div>
      <Dialog disableEscapeKeyDown open={open} onClose={handleClose}>
        {content}
      </Dialog>
    </div>
  );
}
