import AutoComplete from 'material-ui/AutoComplete';
import MenuItem from 'material-ui/MenuItem';
import React from 'react';
import { booksAPIRef } from '../../config/API';
import { booksRef } from '../../config/firebase';
import { join, normalizeCover, normalizeString, switchGenres, switchLanguages } from '../../config/shared';
import { userType } from '../../config/types';

export default class SearchBookForm extends React.Component {
  state = {
    searchText: '',
    loading: false,
    maxSearchResults: 8,
    options: []
  }

  static propTypes = {
    user: userType
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
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
    if (this.props.new) {
      fetch(new Request(booksAPIRef({q: searchText, inTitle: searchText}), { method: 'GET' })).then(res => res.json()).then(json => {
        //console.log(json.items);   
        let options = [];
        if (json.items && json.items.length > 0) {
          json.items.forEach(item => {
            const b = item.volumeInfo;
            const iis = b.industryIdentifiers;
            const ISBN_13 = (iis && iis.filter(ii => ii.type === 'ISBN_13')) || [];
            const ISBN_10 = (iis && iis.filter(ii => ii.type === 'ISBN_10')) || [];
            options.push({
              ISBN_13: (!!ISBN_13[0] && Number(ISBN_13[0].identifier)) || 0,
              ISBN_10: (!!ISBN_10[0] && Number(ISBN_10[0].identifier)) || 0,
              EDIT: {
                createdBy: this.props.user.displayName || '',
                createdByUid: this.props.user.uid || '',
                created_num: (new Date()).getTime() || 0
              },
              authors: b.authors || [],
              bid: '',
              collections: [],
              covers: (b.imageLinks && [normalizeCover(b.imageLinks.small || b.imageLinks.thumbnail || b.imageLinks.smallThumbnail)]) || [],
              description: b.description || '',
              edition_num: 1,
              format: b.printType === 'BOOK' ? 'Libro' : 'Rivista' || '',
              genres: (b.categories && switchGenres(b.categories)) || [],
              incipit: '',
              languages: [(b.language && switchLanguages(b.language))] || [],
              pages_num: (b.pageCount && Number(b.pageCount)) || 0,
              publication: b.publishedDate || '',
              publisher: b.publisher || '',
              rating_num: 0,
              ratings_num: 0,
              readers_num: 0,
              reviews_num: 0,
              subtitle: b.subtitle || '',
              text: b.title || '', // OPTION TEXT
              title: b.title || '',
              title_sort: normalizeString(b.title) || '',
              value: (
                <MenuItem
                  className="menuitem-book"
                  primaryText={
                    <div className="primaryText">
                      {b.imageLinks && <img className="thumbnail" src={[b.imageLinks.smallThumbnail || b.imageLinks.small || b.imageLinks.thumbnail]} alt={b.title} />} 
                      <span className="title">{b.title}</span>
                    </div>
                  }
                  secondaryText={b.authors && <div className="secondaryText">di {join(b.authors)}</div>}
                />
              )
            })
          });
          this.setState({
            loading: false,
            options: options
          });
        }
      });
    } else {
      booksRef.where('title_sort', '>=', searchText).orderBy('title_sort').limit(this.state.maxSearchResults).onSnapshot(snap => {
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
                    {doc.data().covers.length > 0 && <img className="thumbnail" src={doc.data().covers[0]} alt={doc.data().title} />}
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
  }

  onNewRequest = chosenRequest => {
    this.setState({ loading: false });
    //console.log({'chosenRequest': chosenRequest});
    this.props.onBookSelect(chosenRequest);
  }

  onClose = () => {
    clearTimeout(this.timer);
    this.setState({ loading: false });
  }

  render() {
    return (
      <form className="container sm" ref="SearchBookFormComponent">
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
            maxSearchResults={this.state.maxSearchResults}
            dataSource={this.state.options}
            //dataSourceConfig={{text: 'bid', value: 'bid'}}
          />
        </div>
      </form>
    )
  }
}