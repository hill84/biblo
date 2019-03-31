import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import React from 'react';
import { boolType, funcType } from '../config/types';

export default class FlagDialog extends React.Component {
  state = {
    value: null
  }

  static propTypes = {
    onClose: funcType.isRequired,
    open: boolType.isRequired,
    TransitionComponent: funcType
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  onClose = () => this.props.onClose();
  
  onChange = e => {
    if (this._isMounted) {
      this.setState({ value: e.target.value });
    }
  }
  
  onFlag = () => this.props.onFlag(this.state.value);

  render() { 
    const { value } = this.state;
    const { loading, open, TransitionComponent } = this.props;

    return (
      <Dialog
        open={open}
        TransitionComponent={TransitionComponent}
        keepMounted
        onClose={this.onClose}
        aria-labelledby="flag-dialog-title"
        aria-describedby="flag-dialog-description">
        {loading && <div aria-hidden="true" className="loader"><CircularProgress /></div>}
        <DialogTitle id="flag-dialog-title">
          Segnala commento
        </DialogTitle>
        <DialogContent>
          <FormControl component="fieldset">
            <RadioGroup
              aria-label="flag"
              name="flag"
              value={value}
              onChange={this.onChange}>
              <FormControlLabel value="spam" control={<Radio />} label="Contenuti commerciali indesiderati o spam" />
              <FormControlLabel value="porn" control={<Radio />} label="Pornografia o materiale sessualmente esplicito" />
              <FormControlLabel value="hate" control={<Radio />} label="Incitamento all'odio o violenza esplicita" />
              <FormControlLabel value="bully" control={<Radio />} label="Molestie o bullismo" />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions className="dialog-footer flex no-gutter">
          <button type="button" className="btn btn-footer flat" onClick={this.onClose}>Annulla</button>
          <button type="button" className="btn btn-footer primary" onClick={this.onFlag} disabled={!value}>Segnala</button>
        </DialogActions>
      </Dialog>
    );
  }
}