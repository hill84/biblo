import React from 'react';
import { icon } from '../config/icons';
import { numberType, funcType } from '../config/types';

class Stepper extends React.Component {
  state = {
    activeStep: (this.props.percent && (this.props.steps || 4)/100 * (this.props.percent || 0)) || 0,
    percent: this.props.percent || 0,
    steps: this.props.steps || 4
  }

  static propTypes = {
    onNext: funcType,
    onPrev: funcType,
    percent: numberType,
    steps: numberType
  }

  static getDerivedStateFromProps(props, state) {
    if (props.percent !== state.percent) { 
      return { activeStep: (props.percent && state.steps/100 * props.percent), percent: props.percent }; 
    }
    return null;
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentDidUpdate(prevProps, prevState) {
    const { activeStep, steps } = this.state;

    if (this._isMounted) {
      if (activeStep !== prevState.activeStep) {
        this.setState({ percent: 100/steps * activeStep });
      }
    }
  }

  onNext = () => (this.props.onNext && this.props.onNext()) || this.setState(state => ({ activeStep: state.activeStep + 1 }));

  onPrev = () => (this.props.onPrev && this.props.onPrev()) || this.setState(state => ({ activeStep: state.activeStep - 1 }));

  render() { 
    const { activeStep, percent, steps } = this.state;
    const { className } = this.props;

    return (
      <div className={`stepper-container ${className}`}>
        <div className="row">
          <div className="col-auto">
            <button type="button" className="btn flat rounded icon" onClick={this.onPrev} disabled={activeStep === 0}>
            {icon.chevronLeft()}
            </button>
          </div>
          <div className="col">
            <div className="label">Progresso: <b>{Math.round(percent)}%</b></div>
            <div className="stepper-wrapper">
              <div className="stepper">
                <div className={`bar ${activeStep === steps ? 'success' : activeStep === 0 ? 'pristine' : 'inprogress'}`} style={{width: `${100/(steps/activeStep)}%`}}></div>
              </div>
            </div>
          </div>
          <div className="col-auto">
            <button type="button" className="btn flat rounded icon" onClick={this.onNext} disabled={activeStep === steps}>
              {icon.chevronRight()}
            </button>
          </div>
        </div>
      </div>
    );
  }
}
 
export default Stepper;