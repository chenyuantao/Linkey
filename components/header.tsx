import axios from 'axios';
import { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { getAvatarFromData } from '@fractalsoftware/random-avatar-generator';
import SpaceModal, { SpaceModalStatus } from './space-modal';
import MenuWrapper from './menu-wrapper';

const HeaderWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 38px;
  width: 100%;
  box-sizing: border-box;
  background: #01579b;
  padding: 0px 16px;
  color: white;
  .logo {
    cursor: pointer;
    font-weight: 600;
    font-size: 18px;
    padding: 1px 4px;
    &:hover {
      background: #4f83cc;
    }
  }
  .user {
    cursor: pointer;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 1px 4px;
    &:hover {
      background: #4f83cc;
    }
    .avatar {
      margin-right: 8px;
      > svg {
        width: 24px;
        height: 24px;
        border-radius: 50%;
      }
    }
  }
`;

export default function Header({}) {
  const { user, space } = useApp();
  const router = useRouter();
  const [showSpaceModal, setShowSpaceModal] = useState(false);
  return (
    <HeaderWrapper>
      <span className="logo" onClick={() => setShowSpaceModal(true)}>
        Linkey {space ? `· ${space.name}` : ''}
      </span>
      {showSpaceModal && (
        <SpaceModal open={showSpaceModal} setOpen={(o) => setShowSpaceModal(o)} status={SpaceModalStatus.LIST} />
      )}
      {!!user ? (
        <MenuWrapper
          list={[
            {
              title: 'Profile',
            },
            {
              title: 'Logout',
              onClick: async () => {
                await axios.post('/api/users/logout');
                router.replace('/');
              },
            },
          ]}
        >
          <div className="user">
            <span
              className="avatar"
              dangerouslySetInnerHTML={{
                __html: getAvatarFromData(user.avatar_id),
              }}
            />
            <span>{user.nickname}</span>
          </div>
        </MenuWrapper>
      ) : (
        <div className="user" onClick={() => router.replace('/login')}>
          LOGIN
        </div>
      )}
    </HeaderWrapper>
  );
}
