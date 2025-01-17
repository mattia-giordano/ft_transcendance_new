import { Avatar, Checkbox, Stack } from '@mui/material';
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../../App';
import { CreationChannelPkg } from '../../models/Chat.interface';
import { User } from '../../models/User.interface';
import StyledBadge from '../../styles/StyleBage';

interface Prop {
  isVisible: string;
  setVisibility: Function;
}

export function CreateGroup({ isVisible = 'hidden', setVisibility }: Prop) {
  const onlines = useContext(Context).online;
  const socket = useContext(Context).socket;
  const userId = useContext(Context).userId;
  const [groupName, setGroupName] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [invite, setInvite] = useState<User[]>([]);
  const [privateGroup, setPrivateStatus] = useState(false);
  const [groupPass, setGroupPass] = useState('');

  const navigate = useNavigate();

  const nameSubmit = async (event: any) => {
    if (event.target.value) {
      event.preventDefault();
      const response = await fetch(
        `/api/users/likeusername/${event.target.value}`,
        { credentials: 'include' }
      );
      if (response.status !== 200) {
        navigate('/signin');
        return;
      }
      response.json().then((res) => {
        setUsers(
          res.sort((a: User, b: User) => a.username.localeCompare(b.username))
        );
      });
    } else {
      setUsers([]);
    }
  };

  function addUser(e: any, user: User) {
    const id = invite.findIndex((us) => us.id === user.id);

    if (e.target.checked)
      setInvite((pred) => {
        return [...pred, user];
      });
    else
      setInvite((pred) => {
        pred.splice(id, 1);
        return [...pred];
      });
  }

  function handleKeyDown(e: any) {
    if (e.keyCode === 13) {
      createGroup();
      handleClose();
    } else if (e.key === 'Escape') {
      handleClose();
    }
  }

  function createGroup() {
    if (groupName === '') return;
    const roomBuilder: CreationChannelPkg = {
      idUser: userId,
      otherUser: undefined,
      pass: privateGroup ? '' : groupPass,
      name: groupName,
      mode: privateGroup ? 'PRI' : groupPass === '' ? 'PUB' : 'PRO',
      invites: invite.map((a) => a.id),
    };
    socket?.emit('createRoom', roomBuilder);
    setVisibility('hidden');
  }

  function handleClose() {
    setVisibility('hidden');
  }

  return (
    <div
      style={{
        visibility: isVisible === 'visible' ? 'visible' : 'hidden',
        opacity: '1',
      }}
      tabIndex={1}
      onKeyDown={(e) => handleKeyDown(e)}
      className="overlay container-fluid row justify-content-center"
    >
      <div className="col-ms-10">
        <div
          className="group-create mb-sm-3 mb-md-0 contacts_card "
          style={{ height: '39vh', minHeight: '420px', minWidth: '750px' }}
        >
          <div
            className="card-header"
            style={{ height: '39vh', minHeight: '420px', minWidth: '750px' }}
          >
            <span className="close_btn">
              <i
                className="fas fa-times fa-lg"
                onClick={(e) => setVisibility('hidden')}
              ></i>
            </span>
            <div className="card-body contacts_body row scrollable">
              <div className="group-info-box" style={{ minHeight: '280px' }}>
                <div className="info-username-image">
                  <div className="profile-info-text justify-content-center">
                    Group Name:
                  </div>
                  <input
                    id="groupname"
                    name="Change Group Name"
                    type="text"
                    className="form-control"
                    onChange={(e) => {
                      if (/^[a-zA-Z0-9-_]{0,20}$/.test(e.target.value)) {
                        setGroupName(e.target.value);
                      }
                    }}
                    value={groupName}
                  />
                  <div
                    className="profile-info-text"
                    style={{ display: 'flex', marginTop: '20px' }}
                  >
                    Password:
                    <input
                      id="grouppass"
                      style={{ marginLeft: '10px' }}
                      name="Change Group Pass"
                      type="text"
                      className="form-control"
                      onChange={(e) => setGroupPass(e.target.value)}
                      value={!privateGroup ? groupPass : '🚫Disabled🚫'}
                      disabled={privateGroup}
                    />
                    <Checkbox
                      style={{ color: 'white' }}
                      checked={privateGroup}
                      onChange={(e) => setPrivateStatus(e.target.checked)}
                    />{' '}
                    Private
                  </div>
                </div>
                <div
                  className="glow profile-info-text"
                  style={{
                    width: '95%',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  Added Users:{' '}
                  {invite.map((inv: User) => (
                    <span key={inv.id}> {inv.username} </span>
                  ))}
                </div>
              </div>
              <div className="group-info-box" style={{ minHeight: '280px' }}>
                <div
                  className="profile-info-text justify-content-center"
                  style={{ display: 'flex' }}
                >
                  Add a User:
                </div>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Add a User..."
                    name=""
                    className="form-control search"
                    onChange={nameSubmit}
                  />
                  <div className="input-group-prepend">
                    <span className="input-group-text search_btn">
                      <i className="fas fa-search"></i>
                    </span>
                  </div>
                </div>
                <ul className="contacts scrollable-addUser">
                  {users.map((user: User) => {
                    const on = onlines.find(
                      (el) => user.id === el || user.id === -el
                    );
                    return user.id === userId ? null : (
                      <li key={user.id}>
                        <div
                          className="d-flex bd-highlight"
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="img_cont">
                            <Stack direction="row" spacing={2}>
                              <StyledBadge
                                color={
                                  on !== undefined
                                    ? on > 0
                                      ? 'success'
                                      : 'warning'
                                    : 'error'
                                }
                                overlap="circular"
                                invisible={false}
                                anchorOrigin={{
                                  vertical: 'bottom',
                                  horizontal: 'right',
                                }}
                                variant="dot"
                              >
                                <Avatar alt="Img" src={user.avatar} />
                              </StyledBadge>
                            </Stack>
                          </div>
                          <div className="user_info">
                            <span>{user.username}</span>
                          </div>
                          <Checkbox
                            className="checkbox"
                            style={{ color: 'white' }}
                            checked={
                              invite.findIndex((us) => us.id === user.id) === -1
                                ? false
                                : true
                            }
                            onChange={(e) => addUser(e, user)}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div
                className="row"
                style={{ textAlign: 'center', marginTop: '20px' }}
              >
                <div className="col">
                  <button
                    className="btn btn-outline-success"
                    onClick={(e) => createGroup()}
                  >
                    Create
                  </button>
                </div>
                <div className="col">
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={handleClose}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
