import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import React from 'react';
import Link from 'react-router-dom/Link';
import { quotesRef } from '../config/firebase';
import { boolType, stringType } from '../config/types';
import MinifiableText from './minifiableText';

export default class RandomQuote extends React.Component {
  state = {
    author: this.props.author || '',
    bid: '',
    bookTitle: '',
    photoURL: '',
    quote: '',
    auto: false
  }

  static propTypes = {
    author: stringType,
    auto: boolType
  }

  componentDidMount() {
    this.fetchRandomQuote();
  }
  
  fetchRandomQuote = () => {
    let ref = quotesRef();

    if (this.props.author) { ref = quotesRef().where('author', '==', this.props.author).limit(30); }
    ref.get().then(snap => {
      if (!snap.empty) {
        //console.log(snap);
        const count = snap.size;
        const randomIndex = Math.floor(Math.random() * count);
        const quote = snap.docs[randomIndex].data();

        this.setState({
          author: quote.author,
          bid: quote.bid,
          bookTitle: quote.bookTitle,
          photoURL: quote.photoURL,
          quote: quote.quote
        });
      } else {
        this.setState({
          author: '',
          bid: '',
          bookTitle: '',
          photoURL: '',
          quote: ''
        });
      }
    }).catch(error => console.warn(`Error fetching quotes: ${error}`));
  }

  render() {
    const { author, bid, bookTitle, photoURL, quote } = this.state;

    if (!quote) return <div className="loader"><CircularProgress /></div>

    return (
      <blockquote className="blockquote">
        <div className="q"><MinifiableText text={quote} limit={500} /></div>
        <p> 
          {photoURL ? <Avatar className="avatar" src={photoURL} alt={author} /> : '– '}
          <Link to={`/author/${author}`}>{author}</Link>{bookTitle && <em>, {bid ? <Link to={`/book/${bid}`}>{bookTitle}</Link> : bookTitle}</em>}
        </p>
      </blockquote>
    )
  }
}