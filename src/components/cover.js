import React from 'react';
/* import PropTypes from 'prop-types'; */

export default class Cover extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
      data: this.props.book,
      cover: this.props.book.covers[0] || '',
      index: 0,
      loading: false
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.book,
      cover: nextProps.book.covers[0] || '',
      index: 0,
    });
  }

  changeCover = () => {
    const { index, data } = this.state;
    const newIndex = index + 1 >= data.covers.length ? 0 : index + 1;
    this.setState({
      data: { ...this.state.data },
      cover: data.covers[newIndex],
      index: newIndex
    });
  };

  render() {
    const { cover, data } = this.state;

		return (
      <div className="book" ref="coverComponent">
        {cover ?
          <div>
            <div className="cover" style={{backgroundImage: `url(${cover})`}}></div>
            {data.covers.length > 1 && <button className="btn" onClick={this.changeCover}>Cambia copertina</button>}
          </div>
        :
          <div className="cover">
            <h2 className="title">{data.title}</h2>
            {data.subtitle.length > 0 && <h3 className="subtitle">{data.subtitle}</h3>}
            <span className="author">{data.authors}</span>
            <span className="publisher">{data.publisher}</span>
          </div>
        }
      </div>
    );
  }
}