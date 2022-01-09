import React, { FC, KeyboardEvent, MouseEvent } from 'react';

interface OverlayProps {
  onClick: (e: MouseEvent | KeyboardEvent) => void;
}

const Overlay: FC<OverlayProps> = ({
  onClick
}: OverlayProps) => (
  <div
    role='button'
    aria-label='overlay'
    tabIndex={0}
    className='overlay'
    onClick={onClick}
    onKeyDown={onClick}
  />
);
 
export default Overlay;
