import Avatar from '@material-ui/core/Avatar';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grow from '@material-ui/core/Grow';
import React from 'react';
import { Link } from 'react-router-dom';
import { authid, isAuthenticated, reviewerRef, userBookRef } from '../config/firebase';
import { icon } from '../config/icons';
import { abbrNum, getInitials, hasRole, timeSince } from '../config/shared';
import { reviewType, stringType, userType } from '../config/types';
import Cover from './cover';
import FlagDialog from './flagDialog';
import MinifiableText from './minifiableText';
import Rating from './rating';

export default class Review extends React.Component {
  state = {
    flagLoading: false,
    isOpenDeleteDialog: false,
    isOpenFlagDialog: false,
    like: this.props.review.likes.length && this.props.review.likes.indexOf(authid) > -1 ? true : false || false,
    likes_num: this.props.review.likes.length || 0
  }

  static propTypes = {
    bid: stringType,
    review: reviewType.isRequired,
    user: userType
  }

  static getDerivedStateFromProps(props, state) {
    if (props.review.likes.length !== state.likes_num) { return { likes_num: props.review.likes.length }}
    return null;
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  onThumbChange = () => {
    const { like } = this.state;
    const { bid, review } = this.props;
    let likes = review.likes;
    
    if (this._isMounted) {
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

  onFlagRequest = () => this.setState({ isOpenFlagDialog: true });

  onCloseFlagDialog = () => {
    if (this._isMounted) {
      this.setState({ isOpenFlagDialog: false });
    }
  }

  onFlag = value => {
    const { bid, review, user} = this.props;
    const flag = {
      value,
      flaggedByUid: user.uid,
      flagged_num: Number((new Date()).getTime())
    };

    if (bid && review && user) {
      if (this._isMounted) {
        this.setState({ flagLoading: true });
        reviewerRef(bid, review.createdByUid).update({ flag }).then(() => {
          this.setState({ flagLoading: false }, () => {
            this.onCloseFlagDialog();
            // console.log(`Flagged review for ${value}`);
          });
        }).catch(error => console.warn(error.message));
      }
    } else console.warn('Cannot flag');
  }

  onDeleteRequest = () => this.setState({ isOpenDeleteDialog: true });
  onCloseDeleteDialog = () => this.setState({ isOpenDeleteDialog: false });
  onDelete = () => {
    // TODO
    console.log('Deleted');
  }

  render() {
    const { flagLoading, isOpenDeleteDialog, isOpenFlagDialog, like, likes_num } = this.state;
    const { bid, review, user } = this.props;

    const isOwner = review.createdByUid === authid;
    const isAdmin = hasRole(user, 'admin');
    const isEditor = hasRole(user, 'editor');

    return (
      <React.Fragment>
        <div className={`${isAuthenticated() && isOwner ? 'own review' : 'review'} ${isAdmin && review.flag ? `flagged ${review.flag.value}` : ''}`}>
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
                    {/* isAuthenticated() && isOwner && <span className="badge">TU</span> */}
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
                        disabled={!isAuthenticated() || !isEditor || isOwner} 
                        onClick={this.onThumbChange}
                        title={like ? 'Annulla mi piace' : 'Mi piace'}>
                        {icon.thumbUp()} {abbrNum(likes_num)}
                      </button>
                    </div>
                    {/* <div className="counter">
                      <button 
                        type="button"
                        className={`btn flat thumb down ${dislike}`} 
                        disabled={!isAuthenticated() || !isEditor || isOwner} 
                        onClick={this.onThumbChange}
                        title={dislike ? 'Annulla non mi piace' : 'Non mi piace'}>
                        {icon.thumbDown()} {abbrNum(dislikes_num)}
                      </button>
                    </div> */}
                    {isAuthenticated() && isEditor && !isOwner && 
                      <React.Fragment>
                        <div className="counter">
                          <button type="button" className="btn sm flat" disabled={true} onClick={this.onAddResponse}>
                            <span className="show-sm">{icon.pencil()}</span> <span className="hide-sm">Rispondi</span>
                          </button>
                        </div>
                        <div className="counter show-on-hover">
                          <button type="button" className="btn sm flat" onClick={this.onFlagRequest}>
                            <span className="show-sm">{icon.flag()}</span> <span className="hide-sm">Segnala</span>
                          </button>
                        </div>
                      </React.Fragment>
                    }
                    {isAuthenticated() && isEditor && (isOwner || isAdmin) && 
                      <div className="counter show-on-hover">
                        <button type="button" className="btn sm flat" onClick={this.onDeleteRequest}>
                          <span className="show-sm">{icon.delete()}</span> <span className="hide-sm">Elimina</span>
                        </button>
                      </div>
                    }
                  </div>
                  <div className="col counter text-right date">{timeSince(review.created_num)}</div>
                </div>
              }
            </div>
          </div>
        </div>

        <Dialog
          open={isOpenDeleteDialog}
          TransitionComponent={Transition}
          keepMounted
          onClose={this.onCloseDeleteDialog}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description">
          <DialogTitle id="delete-dialog-title">
            Procedere con l'eliminazione?
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              Cancellando la recensione perderai tutti i like e i commenti ricevuti.
            </DialogContentText>
          </DialogContent>
          <DialogActions className="dialog-footer flex no-gutter">
            <button className="btn btn-footer flat" onClick={this.onCloseDeleteDialog}>Annulla</button>
            <button className="btn btn-footer primary" onClick={this.onDelete}>Elimina</button>
          </DialogActions>
        </Dialog>

        <FlagDialog 
          loading={flagLoading}
          open={isOpenFlagDialog} 
          onClose={this.onCloseFlagDialog} 
          onFlag={this.onFlag} 
          TransitionComponent={Transition} 
        />
      </React.Fragment>
    );
  }
}

const Transition = React.forwardRef((props, ref) => <Grow {...props} ref={ref} /> );