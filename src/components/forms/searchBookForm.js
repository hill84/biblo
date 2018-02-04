import React from 'react';
import { AutoComplete/* , CircularProgress */, MenuItem } from 'material-ui';
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
    this.setState({ searchText: searchText.normalize().toLowerCase() });
    this.timer = setTimeout(this.fetchOptions, 500);
  }

  fetchOptions = () => {
    const { searchText } = this.state;
    if (!searchText) return;
    this.setState({ loading: true });
    booksRef.where('title_sort', '>=', searchText).orderBy('title_sort').limit(5).onSnapshot(snap => {
      let options = [];
      snap.forEach(doc => {
        options.push({
          ...doc.data(),
          text: doc.data().title,
          value: (
            <MenuItem
              className="menuitem-book"
              primaryText={(
                <div className="primaryText">
                  <img className="thumbnail" src={doc.data().covers.length > 0 && doc.data().covers[0]} alt={doc.data().title} /> 
                  <span className="title">{doc.data().title}</span>
                </div>
              )}
              secondaryText={<div className="secondaryText">di {doc.data().authors}</div>}
            />
          )
        })
      });

      this.setState({
        loading: false,
        options: options
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
      <form ref="SearchBookFormComponent" className="container-sm">
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
            //dataSourceConfig={{text: 'bid', value: 'bid'}}
          />
        </div>
      </form>
    )
  }
}