import { DocumentData } from '@firebase/firestore-types';
import React, { createContext, Dispatch, FC, SetStateAction, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { followersRef, followingsRef, userChallengesRef, userRef } from '../config/firebase';
import { profileKeys } from '../config/lists';
import '../css/dashboard.css';
import { BookModel, FollowersModel, IsCurrent, UserChallengeModel, UserModel } from '../types';
import UserContext from './userContext';

let userFetchCanceler: (() => void) | null = null;
let collectionFetchCanceler: (() => void) | null = null;
let luidFollowersFetchCanceler: (() => void) | null = null;
let luidFollowingsFetchCanceler: (() => void) | null = null;
let uidFollowersFetchCanceler: (() => void) | null = null;
let uidFollowingsFetchCanceler: (() => void) | null = null;

interface DashboardContextModel {
  challenges: UserChallengeModel[];
  duser?: UserModel;
  follow: boolean;
  followers: FollowersModel;
  followings: FollowersModel;
  lfollowers: FollowersModel;
  lfollowings: FollowersModel;
  loading: boolean;
  progress: number;
  shelfCount: number;
  shelfItems: BookModel[];
  wishlistCount: number;
  wishlistItems: BookModel[];
  fetchUser: (uid: string, luid?: string) => void;
  fetchFollowers: (uid: string, luid?: string) => void;
  fetchFollowings: (uid: string, luid?: string) => void;
  fetchuserChallengesRef: (luid?: string) => void;
  setShelfCount: Dispatch<SetStateAction<number>>;
  setShelfItems: Dispatch<SetStateAction<BookModel[]>>;
  setWishlistCount: Dispatch<SetStateAction<number>>;
  setWishlistItems: Dispatch<SetStateAction<BookModel[]>>;
}

const initialDashboardContext: DashboardContextModel = {
  challenges: [],
  duser: undefined,
  follow: false,
  followers: {},
  followings: {},
  lfollowers: {},
  lfollowings: {},
  loading: true,
  progress: 0,
  shelfCount: 0,
  shelfItems: [],
  wishlistCount: 0,
  wishlistItems: [],
  fetchUser: () => null,
  fetchFollowers: () => null,
  fetchFollowings: () => null,
  fetchuserChallengesRef: () => null,
  setShelfCount: () => null,
  setShelfItems: () => null,
  setWishlistCount: () => null,
  setWishlistItems: () => null,
};

const DashboardContext = createContext<DashboardContextModel>(initialDashboardContext);

export default DashboardContext;

export const DashboardProvider: FC = ({ children }) => {
  const { isAuth, user } = useContext(UserContext);
  const [duser, setDuser] = useState<DashboardContextModel['duser']>(initialDashboardContext.duser);
  const [challenges, setChallenges] = useState<DashboardContextModel['challenges']>(initialDashboardContext.challenges);
  const [followers, setFollowers] = useState<DashboardContextModel['followers']>(initialDashboardContext.followers);
  const [followings, setFollowings] = useState<DashboardContextModel['followings']>(initialDashboardContext.followings);
  const [follow, setFollow] = useState<DashboardContextModel['follow']>(initialDashboardContext.follow);
  const [shelfCount, setShelfCount] = useState<DashboardContextModel['shelfCount']>(initialDashboardContext.shelfCount);
  const [shelfItems, setShelfItems] = useState<DashboardContextModel['shelfItems']>(initialDashboardContext.shelfItems);
  const [wishlistCount, setWishlistCount] = useState<DashboardContextModel['wishlistCount']>(initialDashboardContext.wishlistCount);
  const [wishlistItems, setWishlistItems] = useState<DashboardContextModel['wishlistItems']>(initialDashboardContext.wishlistItems);
  const [lfollowers, setLfollowers] = useState<DashboardContextModel['lfollowers']>(initialDashboardContext.lfollowers);
  const [lfollowings, setLfollowings] = useState<DashboardContextModel['lfollowings']>(initialDashboardContext.lfollowings);
  const [loading, setLoading] = useState<DashboardContextModel['loading']>(initialDashboardContext.loading);
  const [progress, setProgress] = useState<DashboardContextModel['progress']>(initialDashboardContext.progress);
  // const [desc, setDesc] = useState<DashboardContextModel['desc']>(initialDashboardContext.desc);
  // const [filterByIndex, setFilterByIndex] = useState<DashboardContextModel['filterByIndex']>(initialDashboardContext.filterByIndex);
  // const [orderByIndex, setOrderByIndex] = useState<DashboardContextModel['orderByIndex']>(initialDashboardContext.orderByIndex);

  const is = useRef<IsCurrent>(false);

  useEffect(() => {
    is.current = true;
  }, []);

  const calcProgress = useCallback((user: UserModel | undefined): number => {
    if (!user) return 0;
    let count = 0;
    const keys: string[] = Object.keys(user).filter((item: string): boolean => profileKeys.includes(item));
    const tot: number = profileKeys.length;
    
    keys?.forEach((key: string): void => { 
      const value: unknown = user[key as keyof UserModel];
      // console.log(key + ': ' + typeof value + ' - ' + value);
      if (typeof value === 'string') {
        if (value !== '') count++;
      } else if (Array.isArray(value)) {
        if (value.length > 0) count++;
      } else count++;
    });
    
    if (tot) return Number((100 / tot * count).toFixed(0));
    return 0;
  }, []);

  const fetchUser = useCallback((uid: string, luid?: string): void => {
    // console.log('fetchUser', uid);
    if (luid === uid) {
      if (is.current) {
        setDuser(user);
        setProgress(calcProgress(user));
        setLoading(false);
      }
    } else {
      if (is.current) setLoading(true);
      userFetchCanceler = userRef(uid).onSnapshot((snap: DocumentData): void => {
        if (snap.exists) {
          setDuser(snap.data());
          setProgress(calcProgress(snap.data()));
        } else {
          setDuser(initialDashboardContext.duser);
          setProgress(initialDashboardContext.progress);
        }
        setLoading(false);
      }, err => console.warn(err));
    }
  }, [calcProgress, user]);

  const fetchFollowers = useCallback((uid: string, luid?: string): void => {
    // console.log('fetchFollowers', uid);
    uidFollowersFetchCanceler = followersRef(uid).onSnapshot((snap: DocumentData): void => {
      if (snap.exists) {
        setFollowers(snap.data());
        setFollow(luid ? Object.keys(snap.data()).indexOf(luid) > -1 : false);
      } else {
        setFollowers({});
        setFollow(false);
      }
    });
    if (isAuth) {
      if (luid && luid !== uid) {
        // console.log('fetching lfollowers');
        luidFollowersFetchCanceler = followersRef(luid).onSnapshot((snap: DocumentData): void => {
          if (snap.exists) {
            setLfollowers(snap.data());
          } else {
            setLfollowers({});
          }
        });
      }
    }
  }, [isAuth]);

  const fetchFollowings = useCallback((uid: string, luid?: string): void => {
    // console.log('fetchFollowings', uid);
    uidFollowingsFetchCanceler = followingsRef(uid).onSnapshot((snap: DocumentData): void => {
      if (snap.exists) {
        setFollowings(snap.data());
      } else {
        setFollowings({});
      }
    });
    
    if (luid && luid !== uid) {
      // console.log('fetching lfollowings');
      luidFollowingsFetchCanceler = followingsRef(luid).onSnapshot((snap: DocumentData): void => {
        if (snap.exists) {
          setLfollowings(snap.data());
        } else {
          setLfollowings({});
        }
      });
    }
  }, []);

  const fetchuserChallengesRef = useCallback((luid?: string): void => {
    // console.log('fetchuserChallengesRef');
    if (!luid) return;
    collectionFetchCanceler = userChallengesRef(luid).onSnapshot((snap: DocumentData): void => {
      if (!snap.empty) {
        const challenges: UserChallengeModel[] = [];
        snap.forEach((doc: DocumentData): number => challenges.push(doc.data()));
        setChallenges(challenges);
      }
    });
  }, []);

  useEffect(() => () => {
    is.current = false;
    userFetchCanceler?.();
    collectionFetchCanceler?.();
    luidFollowersFetchCanceler?.();
    luidFollowingsFetchCanceler?.();
    uidFollowersFetchCanceler?.();
    uidFollowingsFetchCanceler?.();
  }, []);

  const provided = useMemo((): DashboardContextModel => ({ 
    challenges,
    duser,
    followers,
    followings,
    follow,
    lfollowers,
    lfollowings,
    loading,
    progress,
    shelfCount,
    shelfItems,
    wishlistCount,
    wishlistItems,
    fetchUser,
    fetchFollowers,
    fetchFollowings,
    fetchuserChallengesRef,
    setShelfCount,
    setShelfItems,
    setWishlistCount,
    setWishlistItems,
  }), [challenges, duser, fetchFollowers, fetchFollowings, fetchUser, fetchuserChallengesRef, follow, followers, followings, lfollowers, lfollowings, loading, progress, shelfCount, shelfItems, wishlistCount, wishlistItems]);

  return (
    <DashboardContext.Provider value={provided}>
      <div ref={is}>
        {children}
      </div>
    </DashboardContext.Provider>
  );
};