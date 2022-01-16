import { useState } from 'react';
import { useSWRConfig } from 'swr';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import axios from 'axios';
import { useApp } from '@/lib/AppContext';

export default function ChannelModal({ open, setOpen }: any) {
  const { mutate } = useSWRConfig();
  const { showToast, space } = useApp();
  const [channelName, setChannelName] = useState('');
  const [priv, setPriv] = useState('1');

  const handleClose = (event, reason) => {
    if (reason !== 'backdropClick') {
      setOpen(false);
    }
  };

  return (
    <div>
      <Dialog disableEscapeKeyDown open={open} onClose={handleClose}>
        <DialogTitle>Create Channel</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: 'flex', flexWrap: 'wrap' }}>
            <FormControl fullWidth>
              <TextField
                label="channel name"
                variant="standard"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
              />
              <FormLabel component="legend" style={{ marginTop: 16 }}>
                channel privacy
              </FormLabel>
              <RadioGroup
                value={priv}
                onChange={(e) => setPriv(e.target.value)}
                row
                aria-label="channel privacy"
                defaultValue="1"
                name="radio-buttons-group"
              >
                <FormControlLabel value="1" control={<Radio />} label="Auto Public" />
                <FormControlLabel value="2" control={<Radio />} label="Manual Public" />
                <FormControlLabel value="3" control={<Radio />} label="Private" />
              </RadioGroup>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>CLOSE</Button>
          <Button
            variant="contained"
            disabled={!channelName && !!priv}
            onClick={async () => {
              const { data: createRes } = await axios.post('/api/channels/create', {
                name: channelName,
                privacy: Number(priv),
                space_id: space.id,
              });
              if (createRes.code !== 0) {
                return;
              }
              setOpen(false);
              showToast({
                severity: 'success',
                message: 'channel created',
              });
              mutate(`/api/users/channels?space_id=${space.id}`);
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
