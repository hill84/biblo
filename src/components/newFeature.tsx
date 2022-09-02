import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import DonationButtons from './donationButtons';

const NewFeature: FC = () => {
  const { t } = useTranslation(['common']);

  return (
    <div className='container empty'>
      <div className='text-center'>
        <div className='pad-v'>
          <h2>{t('FEATURE_NOT_READY')}</h2>
          <p>{t('HELP_ME_GROW_BIBLO')}. <span className='hide-sm'>{t('CONTRIBUTE_WITH_A_DONATION')}.</span></p>
          
          <div className='pad-v'>
            <DonationButtons />
          </div>
          
          <p className='font-sm'>
            <Link className='counter' to='/donations'>{t('WHY_ITS_IMPORTANT')}</Link>
            <Link className='counter' to='/about'>{t('PAGE_ABOUT')}</Link>
            <Link className='counter' to='/terms'>{t('PAGE_TERMS')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
 
export default NewFeature;