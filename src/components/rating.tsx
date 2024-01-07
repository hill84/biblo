import type { FC } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Rater from 'react-rater';
import { ratingLabels } from '../config/lists';
import '../css/rating.css';
import type { RatingsModel } from '../types';

interface RatingProps {
  labels?: boolean;
  ratings: Partial<RatingsModel>;
}

const Rating: FC<RatingProps> = ({
  labels,
  ratings,
}: RatingProps) => {
  const ratings_num: number = ratings.ratings_num || 0;
  const rating_num: number = ratings.rating_num || 0;
  const averageRating_num = useMemo((): number => ratings.rating_num !== undefined && ratings.ratings_num !== undefined ? Math.round(ratings.rating_num / ratings.ratings_num * 10) / 10 : 0, [ratings.rating_num, ratings.ratings_num]);

  const { t } = useTranslation(['common']);

  return (
    <div className='rating' title={ratingLabels[ratings_num ? averageRating_num : rating_num]}>
      <Rater
        interactive={false}
        rating={ratings_num ? averageRating_num : rating_num}
        total={5}
      />
      {labels && (
        <div className='rating-labels'>
          <span className='label rating-num'>{ratings_num ? averageRating_num : rating_num}</span>
          <span className='label ratings-num'>{t('VOTES_COUNT', { count: ratings_num })}</span>
        </div>
      )}
    </div>
  );
};
 
export default Rating;