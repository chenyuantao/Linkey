import React, { useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

export default function MenuWrapper({ children, list }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      {React.cloneElement(children, {
        onClick: handleClick,
      })}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        {list.map((l) => (
          <MenuItem
            key={l.title}
            onClick={(e: any) => {
              handleClose();
              l?.onClick?.(e);
            }}
          >
            {l.title}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
