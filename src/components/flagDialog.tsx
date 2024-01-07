import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import type { TransitionProps } from '@material-ui/core/transitions';
import type { ChangeEvent, ComponentType, FC, ReactElement } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface FlagDialogProps {
  loading?: boolean;
  onClose: () => void;
  onFlag: (value: string) => void;
  open: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TransitionComponent?: ComponentType<TransitionProps & { children?: ReactElement<any, any> }>;
  value?: string;
}

const FlagDialog: FC<FlagDialogProps> = ({
  loading = false,
  onClose,
  onFlag: _onFlag,
  open,
  TransitionComponent,
  value: _value
}: FlagDialogProps) => {
  const [value, setValue] = useState(_value);

  const { t } = useTranslation(['common']);
  
  const onChange = (e: ChangeEvent<HTMLInputElement>): void => setValue(e.target.value);
  const onFlag = (): void => _onFlag(value as string);

  return (
    <Dialog
      open={open}
      TransitionComponent={TransitionComponent}
      keepMounted
      onClose={onClose}
      aria-labelledby='flag-dialog-title'>
      {loading && <div aria-hidden='true' className='loader'><CircularProgress /></div>}
      <DialogTitle id='flag-dialog-title'>
        {t('FLAG_COMMENT')}
      </DialogTitle>
      <DialogContent>
        <FormControl component='fieldset'>
          <RadioGroup
            aria-label='flag'
            name='flag'
            value={value}
            onChange={onChange}>
            <FormControlLabel value='spam' control={<Radio />} label={t('FLAG_SPAM')} />
            <FormControlLabel value='porn' control={<Radio />} label={t('FLAG_PORN')} />
            <FormControlLabel value='hate' control={<Radio />} label={t('FLAG_HATE')} />
            <FormControlLabel value='bully' control={<Radio />} label={t('FLAG_BULLY')} />
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions className='dialog-footer flex no-gutter'>
        <button
          type='button'
          className='btn btn-footer flat'
          onClick={onClose}>
          {t('ACTION_CANCEL')}
        </button>
        {value && (
          <button 
            type='button' 
            className='btn btn-footer primary' 
            onClick={onFlag}>
            {t('ACTION_FLAG')}
          </button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default FlagDialog;