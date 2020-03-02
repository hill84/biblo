import Tooltip from '@material-ui/core/Tooltip';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import icon from '../config/icons';
import { funcType, numberType, stringType } from '../config/types';

const Stepper = props => {
  const [state, setState] = useState({
    activeStep: (props.value && props.steps / 100 * props.value) || 0,
    value: props.value,
    steps: props.steps
  });

  const is = useRef(true);
  const { className, max, value } = props;
  const { activeStep, steps } = state;

  useEffect(() => {
    if (is.current && steps) {
      setState(prevState => ({ ...prevState, value: 100 / steps * activeStep }));
    }
  }, [activeStep, steps]);

  useEffect(() => {
    if (is.current && steps) {
      setState(prevState => ({ ...prevState, activeStep: (value && steps / 100 * value), value }));
    }
  }, [steps, value]);

  useEffect(() => () => {
    is.current = false;
  }, []);

  const onNext = () => props.onNext?.() || (is.current && setState(prevState => ({ ...prevState, activeStep: prevState.activeStep + 1 })));

  const onPrev = () => props.onPrev?.() || (is.current && setState(prevState => ({ ...prevState, activeStep: prevState.activeStep - 1 })));

  const percentage = useMemo(() => Math.round(100 / (steps / activeStep)), [activeStep, steps]);

  return (
    <div className={`stepper-container ${className}`} ref={is}>
      <div className="row">
        <div className="col-auto">
          <button type="button" className="btn flat rounded icon" onClick={onPrev} disabled={activeStep === 0}>
            {icon.chevronLeft}
          </button>
        </div>
        <div className="col">
          <Tooltip title={max ? `(~${Math.round(max / 100 * value)} di ${max} pagine)` : `${percentage}%`}>
            <label htmlFor="progress">Progresso <b>{percentage}%</b></label>
          </Tooltip>
          <progress id="progress" max={100} value={percentage} />
        </div>
        <div className="col-auto">
          <button type="button" className="btn flat rounded icon" onClick={onNext} disabled={activeStep === steps}>
            {icon.chevronRight}
          </button>
        </div>
      </div>
    </div>
  );
}

Stepper.propTypes = {
  className: stringType,
  onNext: funcType,
  onPrev: funcType,
  value: numberType,
  steps: numberType,
  max: numberType
}

Stepper.defaultProps = {
  className: null,
  onNext: null,
  onPrev: null,
  value: 0,
  steps: 4,
  max: null
}
 
export default Stepper;