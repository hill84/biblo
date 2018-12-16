import Avatar from '@material-ui/core/Avatar';
import React from 'react';
import { Link } from 'react-router-dom';
import { isAuthenticated, reviewerRef, authid, userBookRef } from '../config/firebase';
import { icon } from '../config/icons';
import { abbrNum, getInitials, timeSince } from '../config/shared';
import { reviewType, stringType } from '../config/types';
import Rating from './rating';
import MinifiableText from './minifiableText';
import Cover from './cover';

export default class Review extends React.Component {
  state = {
    like: this.props.review.likes.length && this.props.review.likes.indexOf(authid) > -1 ? true : false || false,
    likes_num: this.props.review.likes.length || 0
  }

  static propTypes = {
    bid: stringType,
    review: reviewType.isRequired
  }

  static getDerivedStateFromProps(props, state) {
    if (props.review.likes.length !== state.likes_num) { return { likes_num: props.review.likes.length }}
    return null;
  }

  onThumbChange = () => {
    const { like } = this.state;
    const { bid, review } = this.props;
    let likes = review.likes;

    if (like) {
      likes = likes.filter(e => e !== authid);
      this.setState({ like: false, likes_num: likes.length });
      // console.log(`User ${authid} remove like on review ${bid}/${review.createdByUid}`);
      // console.log(`User likes decreased to ${likes.length}`);
    } else {
      likes = [...likes, authid];
      this.setState({ like: true, likes_num: likes.length });
      // console.log(`User ${authid} add like on review ${bid}/${review.createdByUid}`);
      // console.log(`User likes increased to ${likes.length}`);
    }
    // console.log({likes, 'likes_num': likes.length});
    if (bid && review.createdByUid) {
      reviewerRef(bid, review.createdByUid).update({ likes }).then(() => {
        // console.log(`Book review likes updated`);
      }).catch(error => console.warn(error.message));

      userBookRef(review.createdByUid, bid).update({ likes }).then(() => {
        // console.log(`User book review likes updated`);
      }).catch(error => console.warn(error.message));
    } else console.warn('No bid or ruid');
  }

  onAddResponse = () => {
    // TODO
  }

  onSubmitResponse = () => {
    // TODO
  }

  render() {
    const { like, likes_num } = this.state;
    const { bid, review } = this.props;

    return (
      <div className={isAuthenticated() && review.createdByUid === authid ? 'own review' : 'review'}>
        <div className="row">
          <div className="col-auto left">
            {!bid ?
              <Link to={`/book/${review.bid}`} className="hoverable-items">
                <Cover info={false} book={{
                  bid: review.bid,
                  title: review.bookTitle,
                  authors: { 'author': true },
                  covers: review.covers,
                  publisher: 'publisher'
                }} />
                <Avatar className="avatar absolute" src={review.photoURL} alt={review.displayName}>{!review.photoURL && getInitials(review.displayName)}</Avatar>
              </Link>
            :
              <Link to={`/dashboard/${review.createdByUid}`}>
                <Avatar className="avatar" src={review.photoURL} alt={review.displayName}>{!review.photoURL && getInitials(review.displayName)}</Avatar>
              </Link>
            }
          </div>
          <div className="col right">
            <div className="head row">
              <Link to={`/dashboard/${review.createdByUid}`} className="col-auto author">
                <h3>
                  {review.displayName}
                  {/* isAuthenticated() && review.createdByUid === authid && <span className="badge">TU</span> */}
                  {!bid && <span className="date">{timeSince(review.created_num)}</span>}
                </h3>
              </Link>
              
              {review.rating_num > 0 && 
                <div className="col text-right">
                  <Rating ratings={{rating_num: review.rating_num}} labels />
                </div>
              }
            </div>
            {review.title && <h4 className="title">{review.title}</h4>}
            <div className="info-row text">
              <MinifiableText text={review.text} maxChars={500} />
            </div>
            {bid && 
              <div className="foot row">
                <div className="col-auto likes">
                  <div className="counter">
                    <button 
                      type="button"
                      className={`btn flat thumb up ${like}`} 
                      disabled={!isAuthenticated() || (review.createdByUid === authid)} 
                      onClick={this.onThumbChange}
                      title={like ? 'Non mi piace più' : 'Mi piace'}>
                      {icon.thumbUp()} {(likes_num > 0) || (review.createdByUid === authid) ? abbrNum(likes_num) : 'Mi piace'}
                    </button>
                  </div>
                  <div className="counter">
                    <button type="button" disabled className="btn sm flat" onClick={this.onAddResponse}>{icon.pencil()} <span className="hide-sm">Rispondi</span></button>
                  </div>
                </div>
                <div className="col counter text-right date">{timeSince(review.created_num)}</div>
              </div>
            }
          </div>
        </div>
      </div>
    );
  }
}