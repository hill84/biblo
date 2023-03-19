import Avatar from '@material-ui/core/Avatar';
import MenuItem from '@material-ui/core/MenuItem';
import DOMPurify from 'dompurify';
import type { ForwardRefRenderFunction, Ref } from 'react';
import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import icon from '../config/icons';
import { getInitials, timeSince } from '../config/shared';
import type { NoteModel } from '../types';

interface NoteMenuItemProps {
  index?: number;
  item?: NoteModel;
  animation?: boolean;
}

const NoteMenuItem: ForwardRefRenderFunction<HTMLLIElement, NoteMenuItemProps> = ({
  index = 0,
  item,
  animation = true,
}: NoteMenuItemProps, ref: Ref<HTMLLIElement>) => {
  if (!item) return null;

  const { created_num, createdBy, createdByUid, nid, photoURL, tag, text } = item;

  const sanitizedHtml: string = DOMPurify.sanitize(text);

  return (
    <MenuItem key={nid} style={animation ? { animationDelay: `${(index + 1) / 10  }s`, } : { animation: 'none' }} ref={ref}> 
      <div className='row'>
        <div className='col-auto'>
          {(photoURL || (tag && (tag.indexOf('follow') > -1 || tag.indexOf('like') > -1))) ? (
            <Link to={`/dashboard/${createdByUid}`} className='bubble'>
              <Avatar className='image avatar' alt={createdBy}>
                {photoURL ? <img src={photoURL} alt='' /> : createdBy ? getInitials(createdBy) : undefined}
              </Avatar>
            </Link>
          ) : (
            <span className='icon'>{icon.bell}</span>
          )}
        </div>
        <div className='col text'>
          <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
        </div>
        <div className='col-auto date'>{timeSince(created_num)}</div>
      </div>
    </MenuItem>
  );
};

export default forwardRef(NoteMenuItem);