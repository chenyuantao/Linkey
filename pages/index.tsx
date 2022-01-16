import Header from '@/components/header';
import { useApp } from '@/lib/AppContext';
import styled from 'styled-components';
import SessionPanel from '@/components/session-panel';
import MessagePanel from '@/components/message-panel';
import SpaceModal from '@/components/space-modal';

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: calc(100vh - 38px);
`;

function IndexPage() {
  const { user, spaces, space, channel } = useApp();
  if (!user) {
    return (
      <div
        className="d-flex flex-row align-items-center justify-content-center"
        style={{
          height: '100vh',
        }}
      >
        Loading...
      </div>
    );
  }
  return (
    <div>
      <Header />
      <Wrapper>
        {space && <SessionPanel />}
        {channel && <MessagePanel />}
        <SpaceModal open={spaces?.length === 0} />
      </Wrapper>
    </div>
  );
}

export default IndexPage;
