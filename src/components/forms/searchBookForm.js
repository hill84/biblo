import CircularProgress from '@material-ui/core/CircularProgress';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import React from 'react';
//import { isAuthenticated } from '../../config/firebase';
import Autosuggest from 'react-autosuggest';
import { booksAPIRef } from '../../config/API';
import { booksRef } from '../../config/firebase';
import { join, normalizeCover, normalizeString, switchGenres, switchLanguages } from '../../config/shared';
import { userType } from '../../config/types';

export default class SearchBookForm extends React.Component {
  state = {
    searchAnchorEl: null,
    searchByAnchorEl: null,
    searchBy: {
      type: 'intitle',
      label: 'titolo',
      hint: 'Sherlock Holmes',
      where: 'title_sort'
    },
    searchText: '',
    value: '',
    loading: false,
    maxSearchResults: 8,
    suggestions: []
  }

  static propTypes = {
    user: userType
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  onClickSearch = option => this.setState({ searchBy: option, searchAnchorEl: null });
  onCloseSearchMenu = () => this.setState({ searchAnchorEl: null });
  onOpenSearchMenu = e => this.setState({ searchAnchorEl: e.currentTarget });

  onClickSearchBy = option => this.setState({ searchBy: option, maxSearchResults: option.type === 'isbn' ? 1 : 8, searchByAnchorEl: null });
  onCloseSearchByMenu = () => this.setState({ searchByAnchorEl: null });
  onOpenSearchByMenu = e => this.setState({ searchByAnchorEl: e.currentTarget });

  renderInput = inputProps => {
    const { ref, label, ...other } = inputProps;
  
    return (
      <TextField fullWidth label={label} InputProps={{ inputRef: ref, ...other }} />
    );
  }

  renderSuggestionsContainer = options => {
    const { containerProps, children } = options;
  
    return (
      <Paper {...containerProps}>
        {children}
      </Paper>
    );
  }

  handleChange = (e, { newValue }) => this.setState({ value: newValue });

  shouldRenderSuggestions = value => value && value.trim().length > 1;

  handleSuggestionsFetchRequested = ({ value }) => this.fetchOptions(value); //this.setState({ suggestions: this.getSuggestions(value) });
/* 
  getSuggestions = value => {
    const inputValue = value.normalize();
    const inputLength = inputValue.length;
    let count = 0;
  
    return inputLength === 0 ? [] : suggestions.filter(suggestion => {
      const keep = count < 5 && suggestion.label.toLowerCase().slice(0, inputLength) === inputValue;
      if (keep) { count += 1; }
      return keep;
    });
  }
*/
  renderSuggestion = (suggestion, { query, isHighlighted }) => {
    const matches = match(suggestion.label, query);
    const parts = parse(suggestion.label, matches);
  
    return (
      <MenuItem key={suggestion.bid} className="menuitem-book" selected={isHighlighted} component="div">
        <div className="primaryText">
          {suggestion.covers[0] && <img className="thumbnail" src={suggestion.covers[0]} alt={suggestion.title} />}
          <span className="title">
            {parts.map((part, index) => {
              return part.highlight ? (
                <strong key={String(index)}>{part.text}</strong>
              ) : (
                <span key={String(index)}>{part.text}</span>
              );
            })}
          </span>
        </div>
        <div className="secondaryText">
          {this.state.searchBy.where === 'ISBN_13' ? Number(!!suggestion.ISBN_13[0] && suggestion.ISBN_13[0].identifier) : `di ${join(suggestion.authors)}`}
        </div>
      </MenuItem>
    );
  }

  getSuggestionValue = suggestion => suggestion.label;

  handleSuggestionsClearRequested = () => this.setState({ suggestions: [] });

  fetchOptions = value => {
    const { maxSearchResults, searchBy } = this.state;
    const { user } = this.props;
    const searchText = value.normalize();
    const searchTextType = String(searchText);
    const emptyBook = {
      ISBN_13: searchBy.where === 'ISBN_13' ? Number(searchText) : 0,
      ISBN_10: 0,
      EDIT: {
        createdBy: (user && user.displayName) || '',
        createdByUid: (user && user.uid) || '',
        created_num: (new Date()).getTime() || 0
      },
      authors: searchBy.where === 'authors.0' ? [searchText] : [],
      bid: '',
      collections: [],
      covers: [],
      description: '',
      edition_num: 1,
      format: 'Libro',
      genres: [],
      incipit: '',
      languages: ['Italiano'],
      pages_num: 0,
      publication: '',
      publisher: searchBy.where === 'publisher' ? searchText : '',
      rating_num: 0,
      ratings_num: 0,
      readers_num: 0,
      reviews_num: 0,
      subtitle: '',
      label: searchText, // Autosuggest OPTION LABEL
      title: searchBy.where === 'title_sort' ? searchText : '',
      title_sort: searchBy.where === 'title_sort' ? normalizeString(searchText) : '',
      value: (
        <MenuItem className="menuitem-book empty">
          <div className="primaryText">
            <span className="title">Libro non trovato...</span>
          </div>
          <button className="btn primary">Crea nuovo</button>
        </MenuItem>
      )
    }

    if (!value) return;
    
    clearTimeout(this.timer);

    this.timer = setTimeout(() => {
      this.setState({ loading: true });
      if (this.props.new) {
        const searchParams = {
          q: searchText, 
          [searchBy.type]: searchTextType
        };
        //console.log(searchParams);
        fetch(new Request(booksAPIRef(searchParams), { method: 'GET' })).then(res => res.json()).then(json => {
          let options = [];
          if (json.items && json.items.length > 0) {
            //console.log(json.items);
            json.items.forEach(item => {
              const b = item.volumeInfo;
              const iis = b.industryIdentifiers;
              const ISBN_13 = (iis && iis.filter(ii => ii.type === 'ISBN_13')) || [];
              const ISBN_10 = (iis && iis.filter(ii => ii.type === 'ISBN_10')) || [];
              options.push({
                ISBN_13: (ISBN_13.length && Number(ISBN_13[0].identifier)) || 0,
                ISBN_10: (ISBN_10.length && Number(ISBN_10[0].identifier)) || 0,
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
                label: b.title || '', // Autosuggest OPTION LABEL
                title: b.title || '',
                title_sort: normalizeString(b.title) || '',
                value: (
                  <MenuItem className="menuitem-book">
                    <div className="primaryText">
                      {b.imageLinks && <img className="thumbnail" src={[b.imageLinks.smallThumbnail || b.imageLinks.small || b.imageLinks.thumbnail]} alt={b.title} />} 
                      <span className="title">{b.title}</span>
                    </div>
                    <div className="secondaryText">
                      {searchBy.where === 'ISBN_13' ? (ISBN_13.length && ISBN_13[0].identifier) : searchBy.where === 'authors.0' ? b.title : `di ${join(b.authors)}`}
                    </div>
                  </MenuItem>
                )
              })
            });
          } else options.push(emptyBook);
          this.setState({ loading: false, suggestions: options });
        });
      } else {
        //console.log(searchBy.where);
        booksRef.where(searchBy.where, '>=', searchTextType).limit(maxSearchResults).onSnapshot(snap => {
          let options = [];
          if (!snap.empty) {
            //console.log(snap);
            snap.forEach(doc => {
              //console.log(doc.data());
              options.push({
                ...doc.data(),
                label: doc.data().title, // Autosuggest OPTION LABEL
                value: (
                  <MenuItem className="menuitem-book">
                    <div className="primaryText">
                      {doc.data().covers.length > 0 && <img className="thumbnail" src={doc.data().covers[0]} alt={doc.data().title} />}
                      <span className="title">{doc.data().title}</span>
                    </div>
                    <div className="secondaryText">{searchBy.where === 'ISBN_13' ? doc.data().ISBN_13 : `di ${doc.data().authors}`}</div>
                  </MenuItem>
                )
              });
            });
          } else {
            options.push(emptyBook);
            console.log(options);
          }
          this.setState({ loading: false, suggestions: options });
        });
      }
    }, 1000);
  }

  onSuggestionSelected = (event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) => {
    if (suggestionIndex !== -1) {
      this.setState({ loading: false });
      clearTimeout(this.timer);
      this.props.onBookSelect(suggestion);
    }
  }

  render() {
    const { loading, searchByAnchorEl, searchBy, suggestions } = this.state;
    const searchByOptions = [
      {type: 'isbn', label: 'ISBN', hint: '9788854152601', where: 'ISBN_13'},
      {type: 'inauthor', label: 'autore', hint: 'Arthur Conan Doyle', where: 'authors[0]'},
      {type: 'inpublisher', label: 'editore', hint: 'Newton Compton', where: 'publisher'},
      {type: 'intitle', label: 'titolo', hint: 'Sherlock Holmes', where: 'title_sort'}
    ].map(option => (
      <MenuItem 
        key={option.type} 
        value={option}
        selected={option.type === searchBy.type}
        onClick={e => this.onClickSearchBy(option)}>
        {option.label}
      </MenuItem>
    ));

    return (
      <div className="container sm search-book-container">
        <div className="form-group">
          {loading && <div className="loader"><CircularProgress /></div>}

          <Autosuggest
            alwaysRenderSuggestions={true}
            renderInputComponent={this.renderInput}
            suggestions={suggestions}
            shouldRenderSuggestions={this.shouldRenderSuggestions}
            onSuggestionsFetchRequested={this.handleSuggestionsFetchRequested}
            onSuggestionsClearRequested={this.handleSuggestionsClearRequested}
            renderSuggestionsContainer={this.renderSuggestionsContainer}
            getSuggestionValue={this.getSuggestionValue}
            renderSuggestion={this.renderSuggestion}
            onSuggestionSelected={this.onSuggestionSelected}
            inputProps={{
              className: `input-field`,
              label: `${this.props.new ? 'Inserisci' : 'Cerca un libro per'} ${searchBy.label}`,
              placeholder: `Es: ${searchBy.hint}`,
              value: this.state.value,
              onChange: this.handleChange,
            }}
          />

          <button className="btn sm flat search-by" onClick={this.onOpenSearchByMenu}>{searchBy.label}</button>

          <Menu anchorEl={searchByAnchorEl} open={Boolean(searchByAnchorEl)} onClose={this.onCloseSearchByMenu}>
            {searchByOptions}
          </Menu>
        </div>
      </div>
    )
  }
}