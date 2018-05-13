import AutoComplete from 'material-ui/AutoComplete';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Popover from 'material-ui/Popover';
import React from 'react';
import { booksAPIRef } from '../../config/API';
import { booksRef } from '../../config/firebase';
import { join, normalizeCover, normalizeString, switchGenres, switchLanguages } from '../../config/shared';
import { userType } from '../../config/types';

export default class SearchBookForm extends React.Component {
  state = {
    anchorEl: null,
    isOpenSearchByMenu: false,
    searchBy: {
      type: 'intitle',
      label: 'titolo',
      hint: 'Sherlock Holmes',
      where: 'title_sort'
    },
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

  onChangeSearchBy = (event, value) => this.setState({ searchBy: value, isOpenSearchByMenu: false });

  onToggleSearchByMenu = event => {
    this.setState({ anchorEl: event.currentTarget });
    this.setState(prevState => ({ isOpenSearchByMenu: !prevState.isOpenSearchByMenu }));
  }

  onUpdateInput = searchText => {
    clearTimeout(this.timer);
    this.setState({ searchText: searchText.normalize().toLowerCase() });
    this.timer = setTimeout(this.fetchOptions, 500);
  }

  fetchOptions = () => {
    const { maxSearchResults, searchBy, searchText } = this.state;
    if (!searchText) return;
    this.setState({ loading: true });
    if (this.props.new) {
      const searchTextType = searchBy.where === 'ISBN_13' ? isNaN(searchText) ? 0 : Number(searchText) : searchText;
      const searchParams = {
        q: searchText, 
        [searchBy.type]: searchTextType
      };
      //console.log(searchParams);
      fetch(new Request(booksAPIRef(searchParams), { method: 'GET' })).then(res => res.json()).then(json => {
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
                  //secondaryText={b.authors && <div className="secondaryText">di {join(b.authors)}</div>}
                  secondaryText={<div className="secondaryText">{searchBy.where === 'ISBN_13' ? Number(ISBN_13[0].identifier) : `di ${join(b.authors)}`}</div>}
                />
              )
            })
          });
          this.setState({
            loading: false,
            options: options
          });
          console.log(options);
        }
      });
    } else {
      const searchTextType = searchBy.where === 'ISBN_13' ? isNaN(searchText) ? 0 : Number(searchText) : searchText;
      booksRef.where(searchBy.where, '>=', searchTextType).limit(maxSearchResults).onSnapshot(snap => {
        console.log(snap);
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

  onNewRequest = (chosenRequest, index) => {
    if (index !== -1) {
      this.setState({ loading: false });
      //console.log({'chosenRequest': chosenRequest});
      this.props.onBookSelect(chosenRequest); 
    } //else console.log(`Clicked enter`);
  }

  onClose = () => {
    clearTimeout(this.timer);
    this.setState({ loading: false });
  }

  render() {
    const { anchorEl, isOpenSearchByMenu, maxSearchResults, options, searchBy, searchText } = this.state;

    return (
      <div className="container sm search-book-container" ref="SearchBookFormComponent">
        <div className="form-group">
          {/* this.state.loading && <div className="loader"><CircularProgress /></div> */}
          <AutoComplete
            name="search"
            floatingLabelText={`Cerca un libro per ${searchBy.label}`}
            hintText={`Es: ${searchBy.hint}`}
            searchText={searchText}
            //filter={(searchText, key) => searchText !== '' && key.indexOf(searchText) !== -1}
            onUpdateInput={this.onUpdateInput}
            onNewRequest={this.onNewRequest}
            onClose={this.onClose}
            fullWidth={true}
            filter={AutoComplete.fuzzyFilter}
            maxSearchResults={maxSearchResults}
            dataSource={options}
            //dataSourceConfig={{text: 'bid', value: 'bid'}}
          />
          <button className="btn sm flat search-by" onClick={this.onToggleSearchByMenu}>{searchBy.label}</button>
          <Popover 
            open={isOpenSearchByMenu} 
            onRequestClose={this.onToggleSearchByMenu} 
            anchorEl={anchorEl} 
            anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
            targetOrigin={{horizontal: 'right', vertical: 'top'}}>
            <Menu onChange={this.onChangeSearchBy}>
              <MenuItem value={{type: 'isbn', label: 'ISBN', hint: '9788854152601', where: 'ISBN_13'}} primaryText="ISBN" />
              <MenuItem value={{type: 'inauthor', label: 'autore', hint: 'Arthur Conan Doyle', where: 'authors'}} primaryText="Autore" />
              {/* <MenuItem value={{type: 'inpublisher', label: 'editore', hint: 'Newton Compton', where: 'publisher'}} primaryText="Editore" /> */}
              <MenuItem value={{type: 'intitle', label: 'titolo', hint: 'Sherlock Holmes', where: 'title_sort'}} primaryText="Titolo" />
            </Menu>
          </Popover>
        </div>
      </div>
    )
  }
}