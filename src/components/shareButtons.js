import Tooltip from '@material-ui/core/Tooltip';
import React from 'react';
import { FacebookIcon, FacebookShareButton, TwitterIcon, TwitterShareButton } from 'react-share';
import { arrayType, stringType } from '../config/types';

const IconProps = { size: 32, round: true };

const ShareButtons = props => {
  const { className, cover, hashtags, text, url, via, ...attrs } = props;
  const fbProps = { className, quote: text, url, ...attrs };
  const twProps = { className, title: text, url, via, ...attrs };

  return (
    <Tooltip title="Condividi" placement="bottom">
      <div className="text-center">
        <FacebookShareButton {...fbProps}>
          <FacebookIcon {...IconProps} />
        </FacebookShareButton>
        <TwitterShareButton {...twProps}>
          <TwitterIcon {...IconProps} />
        </TwitterShareButton>
      </div>
    </Tooltip>
  );
}

ShareButtons.propTypes = {
  className: stringType,
  cover: stringType,
  hashtags: arrayType,
  text: stringType,
  url: stringType.isRequired,
  via: stringType
}

ShareButtons.defaultProps = {
  className: null,
  cover: null,
  hashtags: null,
  text: null,
  via: null
}
 
export default ShareButtons;