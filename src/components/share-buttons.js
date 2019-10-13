import React from 'react';
import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon
} from 'react-share';

const ShareButtons = props => {
  const IconProps = { size: 24, round: true };
  const { className, cover, hashtags, text, url, via, ...attrs } = props;
  const fbProps = { className, quote: text, url, ...attrs };
  const twProps = { className, title: text, url, via, ...attrs };

  return (
    <div className="text-center">
      <FacebookShareButton {...fbProps}>
        <FacebookIcon {...IconProps} />
      </FacebookShareButton>
      <TwitterShareButton {...twProps}>
        <TwitterIcon {...IconProps} />
      </TwitterShareButton>
    </div>
  );
}
 
export default ShareButtons;