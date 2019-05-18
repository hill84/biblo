import React from 'react';

// TODO: A LOT OF THINGS

class SingleBook extends Component {
  state = {
    book: null
  }

  render() { 
    return (
      <div id="singleBookComponent">
        <div className="">cover</div>
        <div className="">
          <h2>{book.title}</h2>
          <h3 className="author">{book.authors}</h3>
          <p className="">{book.description}</p>
        </div>
      </div>
    );
  }
}
 
export default SingleBook;