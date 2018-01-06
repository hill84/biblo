import React from 'react';
import { AutoComplete/* , CircularProgress */ } from 'material-ui';
import { booksRef } from '../../config/firebase';

export default class SearchBookForm extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      searchText: '',
      loading: false,
      options: []
    }
  }

  onUpdateInput = searchText => {
    clearTimeout(this.timer);
    this.setState({ searchText: searchText });
    this.timer = setTimeout(this.fetchOptions, 500);
  }

  fetchOptions = () => {
    if (!this.state.searchText) return;
    this.setState({ loading: true });
    booksRef.on('value', snap => {
      this.setState({
        loading: false,
        options: snap.val()
      });
    });
  }

  onNewRequest = chosenRequest => {
    this.setState({ loading: false });
    this.props.onBookSelect(chosenRequest);
  }

  onClose = () => this.setState({ loading: false });

  render() {
    return (
      <form id="SearchBookFormComponent" className="container-sm">
        <div className="form-group">
          {/* this.state.loading && <div className="loader"><CircularProgress /></div> */}
          <AutoComplete
            name="search"
            floatingLabelText="Cerca un libro inserendo il titolo"
            hintText="Es: Sherlock Holmes"
            searchText={this.state.searchText}
            //filter={(searchText, key) => searchText !== '' && key.indexOf(searchText) !== -1}
            onUpdateInput={this.onUpdateInput}
            onNewRequest={this.onNewRequest}
            onClose={this.onClose}
            fullWidth={true}
            filter={AutoComplete.fuzzyFilter}
            maxSearchResults={5}
            dataSource={this.state.options}
            dataSourceConfig={{text: 'title', value: 'ISBN_num'}}
          />
        </div>
      </form>
    )
  }
}