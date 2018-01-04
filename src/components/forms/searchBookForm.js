import React from 'react';
import { AutoComplete, /* CircularProgress */ } from 'material-ui';

export default class SearchBookForm extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      searchText: '',
      loading: false,
      options: [{
        key: 1,
        value: 1,
        text: "first book"
      },{
        key: 2,
        value: 2,
        text: "second book"
      },{
        key: 3,
        value: 3,
        text: "third book"
      },{
        key: 4,
        value: 4,
        text: "fourth book"
      }],
      books: {}
    }
  }

  handleUpdateInput = (e, data) => {
    clearTimeout(this.timer);
    this.setState({ searchText: data });
    this.timer = setTimeout(this.fetchOptions, 1000);
  }

  fetchOptions = () => {
    if (!this.state.searchText) return;
    this.setState({ loading: true });
  }

  onNewRequest = () => {
    this.setState({ searchText: '', loading: false });
  }

  onClose = () => {
    this.setState({ loading: false });
  }

  render() {
    return (
      <form id="SearchBookFormComponent" className="container-sm">
        <div className="form-group">
          {/*this.state.loading && <div className="loader"><CircularProgress /></div>*/}
          <AutoComplete
            name="search"
            floatingLabelText="Cerca un libro inserendo il titolo"
            hintText="Es: Il grande Gatsby"
            // searchText={this.state.searchText}
            // filter={(searchText, key) => (key.indexOf(searchText) !== -1)}
            onUpdateInput={this.handleUpdateInput}
            onNewRequest={this.onNewRequest}
            onClose={this.onClose}
            fullWidth={true}
            maxSearchResults={3}
            dataSource={this.state.options}
          />
        </div>
      </form>
    )
  }
}