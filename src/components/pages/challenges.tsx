import React, { FC, Fragment, useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { app } from '../../config/shared';
// import { challengeRef, userChallengesRef } from '../../config/firebase';
import UserContext from '../../context/userContext';
import { ChallengesModel } from '../../types';

// const userChallengesMock: UserChallengesModel[] = [
//   { books: [{ author: '', bid: '', cover: '', title: '' }], cid: 'user_challenge_1', completed_num: 0, created_num: 0, description: '', title: 'user_challenge_1' }, 
//   { books: [{ author: '', bid: '', cover: '', title: '' }], cid: 'user_challenge_2', completed_num: 0, created_num: 0, description: '', title: 'user_challenge_2' },
//   { books: [{ author: '', bid: '', cover: '', title: '' }], cid: 'user_challenge_3', completed_num: 0, created_num: 0, description: '', title: 'user_challenge_3' }
// ];

const challengesMock: ChallengesModel[] = [
  { books: [{ author: '', bid: '', cover: '', title: '' }], cid: 'challenge_1', description: '', title: 'challenge_1' }, 
  { books: [{ author: '', bid: '', cover: '', title: '' }], cid: 'challenge_2', description: '', title: 'challenge_2' },
  { books: [{ author: '', bid: '', cover: '', title: '' }], cid: 'challenge_3', description: '', title: 'challenge_3' },
];

////////// 
// TODO //
////////// 

const Challenges: FC = () => {
  const { user } = useContext(UserContext);
  // const [userchallenges, setUserChallenges] = useState([]);
  const [challenges, setChallenges] = useState<ChallengesModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetch = (): void => {
      // console.log('fetch');
      setChallenges(challengesMock);
      // setUserChallenges(userChallengesMock);
      setLoading(false);
    };

    fetch();

    return (): void => fetch();
  }, []);

  if (!user) return null;

  return (
    <div className='container'>
      <Helmet>
        <title>{app.name} | Sfide</title>
      </Helmet>

      {loading ? (
        <div>loading...</div> 
      ) : !challenges ? (
        <div>Nothing to show</div>
      ) : (
        <Fragment>
          <h2>Sfide</h2>
          <div className='card dark card-fullwidth-sm'>
            {challenges?.map(({ cid, description, title }: ChallengesModel) => (
              <div key={cid} className='challenge'>
                <h3>{title}</h3>
                {description && <p>{description}</p>}
              </div>
            ))}
          </div>
        </Fragment>
      )}
    </div>
  );
};

export default Challenges;