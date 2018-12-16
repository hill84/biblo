import React from 'react';
import { boolType, coverType, numberType } from '../config/types';
import { joinObj } from '../config/shared';
import Rating from './rating';

export default class Cover extends React.Component {
  state = {
    book: this.props.book,
    cover: (this.props.book.covers && this.props.book.covers[0]) || '',
    // index: 0
  }

  static propTypes = {
    bcid: numberType,
    book: coverType.isRequired,
    info: boolType,
    page: numberType,
    rating: boolType,
    full: boolType
  }

  static getDerivedStateFromProps(props, state) {
    if (props.book !== state.book) { 
      return { 
        book: props.book, 
        cover: (props.book && props.book.covers[0]) || '', 
        // index: 0
      }; 
    }
    return null;
  }

  /* changeCover = () => {
    const { index, book } = this.state;
    const newIndex = index + 1 >= book.covers.length ? 0 : index + 1;
    this.setState({
      book: { ...this.state.book },
      cover: this.state.book.covers[newIndex],
      index: newIndex
    });
  }; */

  render() {
    const { cover, book } = this.state;
    const { animationDelay, bcid, full, index, info, page, rating } = this.props;
    const delay = page && page > 1 ? 0 : index / 20;

    if (!book) return null;

		return (
      <div className="book"> 
        <div className="cover" title={book.title} style={{animationDelay: (animationDelay !== false) ? `${delay}s` : '', backgroundImage: cover ? `url(${cover})` : null}}>
          {bcid && bcid > 0 ? <div className="bookmark accent"><div>{bcid}</div></div> : ''}
          {book.readingState && book.readingState.state_num === 2 && <div className="bookmark"></div>}
          {book.review && book.review.text && <div className="cover-review">Recensione</div>}
          <div className="overlay" />
          {/* (book.covers && book.covers.length > 1) && 
            <button type="button" className="btn sm neutral centered" onClick={this.changeCover}>Cambia copertina</button> 
          */}
          {!cover &&
            <React.Fragment>
              <h2 className="title">{book.title}</h2>
              {book.subtitle && book.subtitle.length && <h3 className="subtitle">{book.subtitle}</h3>}
              <span className="author">{joinObj(book.authors)}</span>
              <span className="publisher">{book.publisher}</span>
            </React.Fragment>
          }
        </div>
        {info !== false && 
          <div className="info">
            <strong className="title">{book.title}</strong>
            <span className="author"><span className="hide-sm">di</span> {joinObj(book.authors)}</span>
            {full && <span className="publisher">{book.publisher}</span>}
            {book.readingState && book.readingState.state_num === 2 && book.readingState.progress_num > 0 ?
              <div className="stepper">
                <div className="bar" style={{width: `${book.readingState.progress_num}%`}} title={`${book.readingState.progress_num}%`}></div>
              </div>
            : book.rating_num > 0 && rating !== false && 
              <Rating ratings={{rating_num: book.rating_num, ratings_num: book.ratings_num}} />
            }
          </div>
        }
      </div>
    );
  }
}