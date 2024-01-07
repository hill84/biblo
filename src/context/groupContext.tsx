import type { DocumentData, FirestoreError } from '@firebase/firestore-types';
import type { Dispatch, FC, SetStateAction } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { groupFollowersRef, groupRef, userRef } from '../config/firebase';
import { handleFirestoreError } from '../config/shared';
import type { FollowerModel, GroupModel, ModeratorModel } from '../types';
import SnackbarContext from './snackbarContext';
import UserContext from './userContext';

let groupFetch: (() => void) | undefined;
let groupFollowersFetch: (() => void) | undefined;

interface StateModel {
  follow: boolean;
  followers: FollowerModel[];
  item: GroupModel | null;
  loading: boolean;
  moderators: ModeratorModel[];
}

const initialState: StateModel = {
  follow: false,
  followers: [],
  item: null,
  loading: true,
  moderators: [],
};

interface GroupContextModel {
  clearStates: () => void;
  fetchGroup: (gid: string) => void;
  follow: boolean;
  followers: FollowerModel[];
  isOwner: boolean;
  isModerator: boolean;
  item: GroupModel | null;
  loading: boolean;
  moderators: ModeratorModel[];
  moderatorsList: string[];
  ownerUid: string | undefined;
  setFollow: Dispatch<SetStateAction<boolean>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setModerators: Dispatch<SetStateAction<ModeratorModel[]>>;
}

const initialGroupContext: GroupContextModel = {
  clearStates: () => null,
  fetchGroup: () => null,
  follow: initialState.follow,
  followers: initialState.followers,
  isOwner: false,
  isModerator: false,
  item: initialState.item,
  loading: initialState.loading,
  moderators: initialState.moderators,
  moderatorsList: [],
  ownerUid: undefined,
  setFollow: () => null,
  setLoading: () => null,
  setModerators: () => [],
};

const GroupContext = createContext<GroupContextModel>(initialGroupContext);

export default GroupContext;

export const GroupProvider: FC = ({ children }) => {
  const { user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const [follow, setFollow] = useState<boolean>(initialState.follow);
  const [followers, setFollowers] = useState<FollowerModel[]>(initialState.followers);
  const [item, setItem] = useState<GroupModel | null>(initialState.item);
  const [loading, setLoading] = useState<boolean>(initialState.loading);
  const [moderators, setModerators] = useState<ModeratorModel[]>(initialState.moderators);

  const ownerUid: string | undefined = item?.ownerUid;
  const isOwner: boolean = user?.uid === ownerUid;
  const moderatorsList = useMemo((): string[] => item?.moderators || [], [item?.moderators]);
  const isModerator = useMemo((): boolean => Boolean(moderatorsList?.some((uid: string): boolean => uid === user?.uid)), [moderatorsList, user]);

  const fetchFollowers = useCallback(gid => {
    groupFollowersFetch = groupFollowersRef(gid).onSnapshot((snap: DocumentData): void => {
      if (!snap.empty) {
        const followers: FollowerModel[] = [];
        snap.forEach((follower: DocumentData): number => followers.push(follower.data()));
        setFollowers(followers);
      } else {
        setFollowers(initialState.followers);
        setFollow(initialState.follow);
      }
    }, (err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
  }, [openSnackbar]);

  const fetchModerators = useCallback((moderators: string[]): void => {
    const items: ModeratorModel[] = [];
    moderators.forEach((uid: string): void => {
      userRef(uid).get().then((snap: DocumentData): void => {
        if (snap.exists) {
          items.push(snap.data());
        }
      }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
    });
    setModerators(items);
  }, [openSnackbar]);

  const fetchGroup = useCallback((gid: string): void => {
    if (!gid) return;
    setLoading(true);
    groupFetch = groupRef(gid).onSnapshot((snap: DocumentData): void => {
      if (snap.exists) {
        setItem(snap.data());
        fetchFollowers(gid);
        if (snap.data()?.moderators?.length > 1) {
          fetchModerators(snap.data()?.moderators);
        }
      }
      setLoading(false);
    }, (err: FirestoreError): void => {
      openSnackbar(handleFirestoreError(err), 'error');
      setLoading(false);
    });
  }, [fetchFollowers, fetchModerators, openSnackbar]);

  useEffect(() => {
    setFollow(followers.some((follower: FollowerModel): boolean => follower.uid === user?.uid));
  }, [followers, user]);

  useEffect(() => () => {
    groupFetch?.();
    groupFollowersFetch?.();
  }, []);

  const clearStates = useCallback(() => {
    setFollow(initialState.follow);
    setFollowers(initialState.followers);
    setItem(initialState.item);
    setLoading(initialState.loading);
    setModerators(initialState.moderators);
  }, []);

  const provided = useMemo((): GroupContextModel => ({ 
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
    setLoading,
    setModerators
  }), [clearStates, fetchGroup, follow, followers, isOwner, isModerator, item, loading, moderators, moderatorsList, ownerUid]);

  return (
    <GroupContext.Provider value={provided}>
      {children}
    </GroupContext.Provider>
  );
};