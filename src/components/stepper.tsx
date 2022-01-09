import Tooltip from '@material-ui/core/Tooltip';
import classnames from 'classnames';
import React, { FC, useEffect, useMemo, useState } from 'react';
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
  const [state, setState] = useState<StateModel>({
    activeStep: (value && _steps / 100 * value) || 0,
    value,
    steps: _steps
  });

  const { activeStep, steps }: StateModel = state;

  useEffect(() => {
    if (steps) setState(prevState => ({ ...prevState, value: 100 / steps * activeStep }));
  }, [activeStep, steps]);

  useEffect(() => {
    if (steps) setState(prevState => ({ ...prevState, activeStep: (value && steps / 100 * value), value }));
  }, [steps, value]);

  const onNext = () => _onNext?.() || setState(prevState => ({ ...prevState, activeStep: prevState.activeStep + 1 }));

  const onPrev = () => _onPrev?.() || setState(prevState => ({ ...prevState, activeStep: prevState.activeStep - 1 }));

  const percentage = useMemo((): number => Math.round(100 / (steps / activeStep)), [activeStep, steps]);

  return (
    <div className={classnames('stepper-container', className)}>
      <div className='row'>
        <div className='col-auto'>
          <button type='button' className='btn flat rounded icon' onClick={onPrev} disabled={activeStep === 0}>
            {icon.chevronLeft}
          </button>
        </div>
        <div className='col'>
          <Tooltip title={max ? `(~${Math.round(max / 100 * value)} di ${max} pagine)` : `${percentage}%`}>
            <label htmlFor='progress'>Progresso <b>{percentage}%</b></label>
          </Tooltip>
          <progress id='progress' max={100} value={percentage} />
        </div>
        <div className='col-auto'>
          <button type='button' className='btn flat rounded icon' onClick={onNext} disabled={activeStep === steps}>
            {icon.chevronRight}
          </button>
        </div>
      </div>
    </div>
  );
};
 
export default Stepper;