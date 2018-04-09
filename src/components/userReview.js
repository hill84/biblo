import React from 'react';
import { Link } from 'react-router-dom';
import { userType, userBookType } from '../config/types';
import { muiThemePrimary } from '../config/shared';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { CircularProgress, TextField } from 'material-ui';
import { timeSince } from '../config/shared';
import Rater from 'react-rater';
import Avatar from './avatar';
 
export default class UserReview extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
      bid: this.props.bid || '',
      user: this.props.user || {},
      userBook: this.props.userBook || {},
      review: {},
      changes: false,
      text_maxChars: 1500,
      title_maxChars: 255,
      loading: false,
      authError: '',
      errors: {},
      isEditing: false
    }
  }

  componentWillReceiveProps(nextProps, prevState) {
    if (nextProps.userBook !== prevState.userBook) {
      this.setState({ userBook: nextProps.userBook });
    }
  }

  onEditing = () => this.setState({ isEditing: true });

  onSubmit = e => {
    e.preventDefault();
    console.log('submitting');

    if (this.state.changes) {
      const errors = this.validate(this.state.review);
      this.setState({ errors });
      if (Object.keys(errors).length === 0) {
        this.setState({ loading: true });
        // DO SOMETHING
        if (this.props.bid) {
          /* bookRef(this.props.bid).set({
            // DO SOMETHING
          }).then(() => {
            this.setState({
              changes: false,
              errors: {},
              isEditing: false,
              loading: false
            });
          }).catch(error => {
            this.setState({
              authError: error.message,
              loading: false
            });
          }); */
        } else {
          // DO SOMETHING ELSE
        }

      }
    } else {
      this.setState({ isEditing: false });
    }
  }

  onChangeMaxChars = e => {
    let leftChars = `${e.target.name}_leftChars`;
    let maxChars = `${e.target.name}_maxChars`;
    this.setState({
      ...this.state, 
      review: { 
        ...this.state.review, 
        [e.target.name]: e.target.value 
      }, 
      [leftChars]: this.state[maxChars] - e.target.value.length, 
      changes: true
    });
  };

  validate = review => {
    const errors = {};
    if (review.title && review.title.length > this.state.title_maxChars) {
      errors.title = `Lunghezza massima ${this.state.title_maxChars} caratteri`;
    }
    if (!review.text) {
      errors.text = "Aggiungi una recensione";
    } else if (review.text.length > this.state.text_maxChars) {
      errors.text = `Lunghezza massima ${this.state.text_maxChars} caratteri`;
    }
    return errors;
  }
  
  render() {
    const { errors, isEditing, review, text_leftChars, text_maxChars, title_leftChars, title_maxChars, user, userBook } = this.state;

    if (!user || !userBook.bookInShelf) return null;

    return (
      <div className="card primary user-review">
        {userBook.review && !isEditing ?
          <div className="review">
            <div className="row">
              <div className="col-auto left">
                <Avatar src={user.photoURL} alt={user.displayName} />
              </div>
              <div className="col right">
                <div className="head row">
                  <div className="col-auto author">
                    <h3>{user.displayName}</h3>
                  </div>
                  <div className="col text-align-right rating">
                    <Rater total={5} onRate={rate => this.onRateBook(rate)} rating={userBook.rating_num || 0} />
                  </div>
                </div>
                <h4 className="title">Titolo</h4>
                <p className="text">Testo della recensione</p>
                <div className="foot row">
                  <div className="col-auto likes">Like</div>
                  <div className="col text-align-right">Date</div>
                </div>
              </div>
            </div>
          </div>
        : !isEditing &&
          <button className="btn flat centered" onClick={this.onEditing}>Aggiungi una recensione</button>
        }
        {isEditing &&
          <MuiThemeProvider muiTheme={muiThemePrimary}>
            <form className="edit-review" onSubmit={this.onSubmit}>
              <div className="form-group">
                <TextField
                  name="text"
                  type="text"
                  hintText={`Scrivi una recensione (max ${text_maxChars} caratteri)...`}
                  errorText={errors.title}
                  floatingLabelText="Recensione"
                  value={review.text || ''}
                  onChange={this.onChangeMaxChars}
                  fullWidth={true}
                  multiLine={true}
                  rows={3}
                />
                {(text_leftChars !== undefined) && 
                  <p className={`message ${(text_leftChars < 0) && 'alert'}`}>Caratteri rimanenti: {text_leftChars}</p>
                }
              </div>
              <div className="form-group">
                <TextField
                  name="title"
                  type="text"
                  hintText={`Aggiungi un titolo (max ${title_maxChars} caratteri)...`}
                  errorText={errors.title}
                  floatingLabelText="Titolo (opzionale)"
                  value={review.title || ''}
                  onChange={this.onChangeMaxChars}
                  fullWidth={true}
                />
                {(title_leftChars !== undefined) && 
                  <p className={`message ${(title_leftChars < 0) && 'alert'}`}>Caratteri rimanenti: {title_leftChars}</p>
                }
              </div>
              <div className="form-group">
                <button className="btn flat centered">Pubblica</button>
              </div>
            </form>
          </MuiThemeProvider>
        }
      </div>
    );
  }
}

UserReview.propTypes = {
  user: userType,
  userBook: userBookType
}