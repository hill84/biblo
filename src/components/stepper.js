import React, { useEffect, useRef, useState } from 'react';
import icon from '../config/icons';
import { funcType, numberType, stringType } from '../config/types';

const Stepper = props => {
  const [state, setState] = useState({
    activeStep: (props.percent && (props.steps || 4)/100 * (props.percent || 0)) || 0,
    percent: props.percent,
  });

  const is = useRef(true);

  const { className, steps } = props;
  const { activeStep, percent } = state;

  useEffect(() => {
    if (is.current) {
      setState(prevState => ({ ...prevState, percent: 100/steps * activeStep }));
    }
  }, [activeStep, steps]);

  useEffect(() => () => {
    is.current = false;
  }, []);

  const onNext = () => (props.onNext && props.onNext()) || (is.current && setState(prevState => ({ ...prevState, activeStep: prevState.activeStep + 1 })));

  const onPrev = () => (props.onPrev && props.onPrev()) || (is.current && setState(prevState => ({ ...prevState, activeStep: prevState.activeStep - 1 })));

  return (
    <div className={`stepper-container ${className}`} ref={is}>
      <div className="row">
        <div className="col-auto">
          <button type="button" className="btn flat rounded icon" onClick={onPrev} disabled={activeStep === 0}>
          {icon.chevronLeft()}
          </button>
        </div>
        <div className="col">
          <div className="label">Progresso: <b>{Math.round(percent)}%</b></div>
          <div className="stepper-wrapper">
            <div className="stepper">
              <div className={`bar ${activeStep === steps ? 'success' : activeStep === 0 ? 'pristine' : 'inprogress'}`} style={{ width: `${100/(steps/activeStep)}%`, }} />
            </div>
          </div>
        </div>
        <div className="col-auto">
          <button type="button" className="btn flat rounded icon" onClick={onNext} disabled={activeStep === steps}>
            {icon.chevronRight()}
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
  percent: numberType,
  steps: numberType
}

Stepper.defaultProps = {
  className: null,
  onNext: null,
  onPrev: null,
  percent: 0,
  steps: 4
}
 
export default Stepper;