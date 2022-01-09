import Tooltip from '@material-ui/core/Tooltip';
import React, { FC } from 'react';
import { FacebookIcon, FacebookShareButton, TwitterIcon, TwitterShareButton } from 'react-share';

const IconProps = { size: 32, round: true };

interface ShareButtonsProps {
  className?: string;
  // cover?: string;
  // hashtags?: string[];
  text?: string;
  url: string;
  via?: string;
}

const ShareButtons: FC<ShareButtonsProps> = ({
  className,
  // cover,
  // hashtags,
  text,
  url,
  via,
  ...attrs
}: ShareButtonsProps) => {
  const fbProps = { className, quote: text, url, ...attrs };
  const twProps = { className, title: text, url, via, ...attrs };

  return (
    <Tooltip title='Condividi' placement='bottom'>
      <div className='share-buttons text-center'>
        <FacebookShareButton {...fbProps}>
          <FacebookIcon {...IconProps} />
        </FacebookShareButton>
        <TwitterShareButton {...twProps}>
          <TwitterIcon {...IconProps} />
        </TwitterShareButton>
      </div>
    </Tooltip>
  );
};
 
export default ShareButtons;