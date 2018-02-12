import React from 'react';
import { coverType } from '../config/types';
import Rating from './rating';

export default class Cover extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
      book: this.props.book,
      cover: this.props.book.covers[0] || '',
      index: 0,
      loading: false
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps !== this.props) {
      this.setState({
        book: nextProps.book,
        cover: nextProps.book.covers[0],
        index: 0,
      });
    }
  }

  changeCover = () => {
    const { index, book } = this.state;
    const newIndex = index + 1 >= book.covers.length ? 0 : index + 1;
    this.setState({
      book: { ...this.state.book },
      cover: this.state.book.covers[newIndex],
      index: newIndex
    });
  };

  render() {
    const { cover, book } = this.state;

		return (
      <div className="book" ref="coverComponent">
        {cover ?
          <div>
            <div className="cover" style={{backgroundImage: `url(${cover})`}}>
              <div className="overlay"></div>
            </div>
            {book.rating_num > 0 && <Rating ratings={{rating_num: book.rating_num}} />}
            {book.covers && book.covers.length > 1 && <button className="btn sm neutral centered" onClick={this.changeCover}>Cambia copertina</button>}
          </div>
        :
          <div className="cover">
            <div className="overlay"></div>
            <h2 className="title">{book.title}</h2>
            {book.subtitle && book.subtitle.length > 0 && <h3 className="subtitle">{book.subtitle}</h3>}
            <span className="author">{book.authors}</span>
            <span className="publisher">{book.publisher}</span>
          </div>
        }
      </div>
    );
  }
}

Cover.propTypes = {
  book: coverType.isRequired
}