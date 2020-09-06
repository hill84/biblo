import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { groupFollowersRef, groupRef, userRef } from '../config/firebase';
import { handleFirestoreError } from '../config/shared';
import { elementType } from '../config/types';
import SnackbarContext from './snackbarContext';
import UserContext from './userContext';

const unsub = {
  fetchGroup: null,
  groupModeratorsFetch: null,
  groupFollowersFetch : null
};

const GroupContext = createContext(null);

export default GroupContext;

export const GroupProvider = ({ children }) => {
  const { user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const [follow, setFollow] = useState(false);
  const [followers, setFollowers] = useState(null);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [moderators, setModerators] = useState(null);

  const ownerUid = useMemo(() => item?.ownerUid, [item]);
  const isOwner = useMemo(() => user?.uid === ownerUid, [ownerUid, user]);
  const moderatorsList = useMemo(() => item?.moderators, [item]);
  const isModerator = useMemo(() => moderatorsList?.some(uid => uid === user?.uid), [moderatorsList, user]);

  const fetchFollowers = useCallback(gid => {
    setLoading(true);
    unsub.groupFollowersFetch = groupFollowersRef(gid).onSnapshot(snap => {
      if (!snap.empty) {
        const followers = [];
        snap.forEach(follower => followers.push(follower.data()));
        setFollowers(followers);
      } else {
        setFollowers(null);
        setFollow(false);
      }
    }, err => openSnackbar(handleFirestoreError(err), 'error'));
  }, [openSnackbar]);

  const fetchModerators = useCallback(moderators => {
    const items = [];
    unsub.groupModeratorsFetch = moderators.forEach(uid => {
      userRef(uid).get().then(snap => {
        if (snap.exists) {
          items.push(snap.data());
        }
      }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
    });
    setModerators(items);
  }, [openSnackbar]);

  const fetchGroup = useCallback(gid => {
    setLoading(true);
    unsub.fetchGroup = groupRef(gid).onSnapshot(snap => {
      if (snap.exists) {
          setItem(snap.data());
          setLoading(false);
        fetchFollowers(gid);
        if (snap.data().moderators?.length > 1) {
          fetchModerators(snap.data().moderators);
        }
      }
    }, err => openSnackbar(handleFirestoreError(err), 'error'));
  }, [fetchFollowers, fetchModerators, openSnackbar]);

  useEffect(() => {
    if (followers) {
      setFollow(followers.some(follower => follower.uid === user?.uid));
    }
  }, [followers, user]);

  useEffect(() => () => {
    unsub.fetchGroup && unsub.fetchGroup();
    unsub.groupFollowersFetch && unsub.groupFollowersFetch();
    unsub.groupModeratorsFetch && unsub.groupModeratorsFetch();
  }, []);

  const clearStates = useCallback(() => {
    setFollow(false);
    setFollowers(null);
    setItem(null);
    setLoading(false);
    setModerators(null);
  }, []);

  const GroupProvided = useMemo(() => ({ 
    clearStates, 
    fetchGroup, 
    follow, 
    followers, 
    isOwner, 
    isModerator, 
    item, 
    loading, 
    moderators, 
    moderatorsList,
    ownerUid, 
    setFollow, 
    setModerators
  }), [ 
    clearStates, 
    fetchGroup, 
    follow, 
    followers, 
    isOwner, 
    isModerator, 
    item, 
    loading, 
    moderators, 
    moderatorsList,
    ownerUid, 
    setFollow, 
    setModerators
  ]);

  return (
    <GroupContext.Provider
      value={GroupProvided}>
      {children}
    </GroupContext.Provider>
  );
}

GroupProvider.propTypes = {
  children: elementType.isRequired
}