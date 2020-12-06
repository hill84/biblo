import Tooltip from '@material-ui/core/Tooltip';
import React, { useMemo } from 'react';
import { SayButton } from 'react-say';
import icon from '../config/icons';
import { incipitKey } from '../config/storage';
import { funcType, stringType } from '../config/proptypes';
import '../css/incipit.css';
import useLocalStorage from '../hooks/useLocalStorage';
import Overlay from './overlay';

const Incipit = ({ copyrightHolder, incipit, onToggle, publication, title }) => {
  const [big, setBig] = useLocalStorage(incipitKey.fontBig, false);
  const [dark, setDark] = useLocalStorage(incipitKey.themeDark, false);

  const onToggleDarkTheme = () => setDark(!dark);
  const onToggleSize = () => setBig(!big);

  const publicationYear = useMemo(() => publication && new Date(publication).getFullYear(), [publication]);

  return (
    <>
      <div role="dialog" aria-describedby="incipit" className={`dialog book-incipit force-theme ${dark ? 'dark' : 'light'}`}>
        <div className="absolute-content">
          <div role="navigation" className="head nav row">
            <strong className="col title">{title}</strong>
            <div className="col-auto btn-row">
              <SayButton text={incipit}>
                <Tooltip title="Ascolta" placement="bottom">
                  <div className="btn rounded icon flat audio">{icon.voice}</div>
                </Tooltip>
              </SayButton>
              <Tooltip title="Formato" placement="bottom">
                <button type="button" className="btn rounded icon flat" onClick={onToggleSize}>{icon.formatSize}</button> 
              </Tooltip>
              <Tooltip title="Tema" placement="bottom">
                <button type="button" className="btn rounded icon flat" onClick={onToggleDarkTheme}>{icon.brightness_6}</button> 
              </Tooltip>
              <Tooltip title="Chiudi" placement="bottom">
                <button type="button" className="btn rounded icon flat" onClick={onToggle}>{icon.close}</button>
              </Tooltip>
            </div>
          </div>
          <p className={`incipit ${big ? 'big' : 'regular'}`}>{incipit}</p>
          {copyrightHolder && <p className="copyright">&copy; {publicationYear} {copyrightHolder}</p>}
        </div>
      </div>
      <Overlay onClick={onToggle} />
    </>
  );
}

Incipit.propTypes = {
  copyrightHolder: stringType,
  incipit: stringType.isRequired,
  onToggle: funcType.isRequired,
  publication: stringType,
  title: stringType.isRequired
}

Incipit.defaultProps = {
  copyrightHolder: null,
  publication: null
}
 
export default Incipit;