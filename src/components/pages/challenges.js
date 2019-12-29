import React, { useContext, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
// import { challengeRef, userChallengesRef } from '../../config/firebase';
import UserContext from '../../context/userContext';
import { app } from '../../config/shared';

const Challenges = () => {
  const { user } = useContext(UserContext);
  const [state, setState] = useState({
    challenges: null,
    loading: true,
    /* userChallenges: null */
  });
  const is = useRef(true);
  const { challenges, loading/* , userChallenges */ } = state;

  useEffect(() => {
    const fetch = () => {
      // console.log('fetch');
      if (is.current) {
        setState(prevState => ({ 
          ...prevState,
          challenges: [
            { books: {}, cid: 'challenge_1', description: '', title: 'challenge_1' }, 
            { books: {}, cid: 'challenge_2', description: '', title: 'challenge_2' },
            { books: {}, cid: 'challenge_3', description: '', title: 'challenge_3' }
          ],
          /* userChallenges: [
            { books: {}, cid: 'user_challenge_1', completed_num: 0, created_num: 0, description: '', title: 'user_challenge_1' }, 
            { books: {}, cid: 'user_challenge_2', completed_num: 0, created_num: 0, description: '', title: 'user_challenge_2' },
            { books: {}, cid: 'user_challenge_3', completed_num: 0, created_num: 0, description: '', title: 'user_challenge_3' }
          ], */
          loading: false
        }));
      }
    }

    fetch();

    return () => {
      is.current = false;
      fetch();
    };
  }, []);

  if (!user) return null;

  return (
    <div className="container" ref={is}>
      <Helmet>
        <title>{app.name} | Sfide</title>
      </Helmet>

      {loading ? (
        <div>loading...</div> 
      ) : !challenges ? (
        <div>Nothing to show</div>
      ) : (
        <>
          <h2>Sfide</h2>
          <div className="card dark card-fullwidth-sm">
            {challenges.map(item => (
              <div className="challenge">
                <h3>{item.title}</h3>
                {item.description && <p>{item.description}</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Challenges;