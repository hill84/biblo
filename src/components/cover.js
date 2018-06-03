import React from 'react';
import { boolType, coverType } from '../config/types';
import { join } from '../config/shared';
import Rating from './rating';

export default class Cover extends React.Component {
  state = {
    book: this.props.book,
    cover: (this.props.book.covers && this.props.book.covers[0]) || '',
    //index: 0
  }

  static propTypes = {
    book: coverType.isRequired,
    info: boolType,
    rating: boolType,
    full: boolType
  }

  static getDerivedStateFromProps(props, state) {
    if (props.book !== state.book) { 
      return { 
        book: props.book, 
        cover: (props.book && props.book.covers[0]) || '', 
        //index: 0
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
    const { full, index, info, rating } = this.props;

    if (!book) return null;

		return (
      <div className="book" ref="coverComponent"> 
        {cover ?
          <div className="cover" style={{backgroundImage: `url(${cover})`, animationDelay: `.${index}s`}} title={book.title}>
            <div className="overlay"></div>
            {/* (book.covers && book.covers.length > 1) && 
              <button className="btn sm neutral centered" onClick={this.changeCover}>Cambia copertina</button> 
            */}
          </div>
        :
          <div className="cover" title={book.title} style={{animationDelay: `.${index}s`}}>
            <div className="overlay"></div>
            <h2 className="title">{book.title}</h2>
            {book.subtitle && book.subtitle.length > 0 && <h3 className="subtitle">{book.subtitle}</h3>}
            <span className="author">{join(book.authors)}</span>
            <span className="publisher">{book.publisher}</span>
          </div>
        }
        {(info !== false) && 
          <div className="info">
            <strong className="title">{book.title}</strong>
            <span className="author">di {join(book.authors)}</span>
            {full && <span className="publisher">{book.publisher}</span>}
            {(book.rating_num > 0) && (rating !== false) && 
              <Rating ratings={{rating_num: book.rating_num, ratings_num: book.ratings_num}} />
            }
          </div>
        }
      </div>
    );
  }
}