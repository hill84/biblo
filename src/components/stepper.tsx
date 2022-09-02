import Tooltip from '@material-ui/core/Tooltip';
import classnames from 'classnames';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import icon from '../config/icons';

interface StepperProps {
  className?: string;
  max?: number;
  onNext?: Function;
  onPrev?: Function;
  steps: number;
  value: number;
}

interface StateModel {
  activeStep: number;
  value: number;
  steps: number;
}

const Stepper: FC<StepperProps> = ({
  className,
  max,
  onNext: _onNext,
  onPrev: _onPrev,
  steps: _steps = 4,
  value = 0,
}: StepperProps) => {
  const initialState = useMemo((): StateModel => ({
    activeStep: (value && _steps / 100 * value) || 0,
    value,
    steps: _steps
  }), [_steps, value]);

  const [state, setState] = useState<StateModel>(initialState);

  const { t } = useTranslation(['common']);

  const { activeStep, steps }: StateModel = state;

  useEffect(() => {
    if (steps) setState(prev => ({ ...prev, value: 100 / steps * activeStep }));
  }, [activeStep, steps]);

  useEffect(() => {
    if (steps) setState(prev => ({ ...prev, activeStep: (value && steps / 100 * value), value }));
  }, [steps, value]);

  const onNext = () => _onNext?.() || setState(prev => ({ ...prev, activeStep: prev.activeStep + 1 }));

  const onPrev = () => _onPrev?.() || setState(prev => ({ ...prev, activeStep: prev.activeStep - 1 }));

  const percentage = useMemo((): number => Math.round(100 / (steps / activeStep)), [activeStep, steps]);

  return (
    <div className={classnames('stepper-container', className)}>
      <div className='row'>
        <div className='col-auto'>
          <button type='button' title={t('ACTION_PREVIOUS')} className='btn flat rounded icon' onClick={onPrev} disabled={activeStep === 0}>
            {icon.chevronLeft}
          </button>
        </div>
        <div className='col'>
          <Tooltip title={max ? `(~${Math.round(max / 100 * value)} ${t('OF')} ${max} ${t('PAGES')})` : `${percentage}%`}>
            <label htmlFor='progress'>
              {t('PROGRESS')} <b>{percentage}%</b>
            </label>
          </Tooltip>
          <progress id='progress' max={100} value={percentage} />
        </div>
        <div className='col-auto'>
          <button type='button' title={t('ACTION_NEXT')} className='btn flat rounded icon' onClick={onNext} disabled={activeStep === steps}>
            {icon.chevronRight}
          </button>
        </div>
      </div>
    </div>
  );
};
 
export default Stepper;