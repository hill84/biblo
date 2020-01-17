import CircularProgress from '@material-ui/core/CircularProgress';
import FormHelperText from '@material-ui/core/FormHelperText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import { ThemeProvider } from '@material-ui/styles';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import React, { Component } from 'react';
import Autosuggest from 'react-autosuggest';
import { Redirect } from 'react-router-dom';
import { booksAPIRef } from '../../config/API';
import { booksRef } from '../../config/firebase';
import { arrToObj, capitalize, normalizeCover, normalizeString, normURL, switchGenres, switchLanguages } from '../../config/shared';
import { darkTheme, defaultTheme } from '../../config/themes';
import { boolType, funcType, userType } from '../../config/types';
import '../../css/searchBook.css';

const searchByOptions = [
  { key: 'title', type: 'intitle', label: 'Titolo', hint: 'Sherlock Holmes', where: 'title_sort' },
  { key: 'ISBN_13', type: 'isbn', label: 'ISBN', hint: '9788854152601', where: 'ISBN_13' },
  { key: 'author', type: 'inauthor', label: 'Autore', hint: 'Arthur Conan Doyle', where: 'authors' },
  { key: 'publisher', type: 'inpublisher', label: 'Editore', hint: 'Newton Compton', where: 'publisher' }
];

export default class SearchBookForm extends Component {
  state = {
    // searchAnchorEl: null,
    searchByAnchorEl: null,
    searchBy: { key: 'title', type: 'intitle', label: 'titolo', hint: 'Sherlock Holmes', where: 'title_sort' },
    // searchText: '',
    value: '',
    loading: false,
    maxSearchResults: 30,
    suggestions: [],
    redirectToReferrer: ''
  }

  static propTypes = {
    new: boolType,
    newBook: boolType,
    onBookSelect: funcType,
    user: userType
  }

  static defaultProps = {
    new: null,
    newBook: false,
    onBookSelect: null,
    user: null
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.searchBy.key !== this.state.searchBy.key) {
      this.setState({ value: '' });
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.timer && clearTimeout(this.timer);
    this.unsubBooksFetch && this.unsubBooksFetch();
    this.unsubQuery && this.unsubQuery();
  }

  /* onClickSearch = option => {
    if (this._isMounted) this.setState({ searchBy: option });
  }
  onCloseSearchMenu = () => {
    if (this._isMounted) this.setState({ searchAnchorEl: null });
  }
  onOpenSearchMenu = e => {
    if (this._isMounted) this.setState({ searchAnchorEl: e.currentTarget });
  } */

  onClickSearchBy = option => {
    if (this._isMounted) {
      this.setState(prevState => ({ 
        searchBy: option, 
        maxSearchResults: option.key === 'ISBN_13' ? 1 : prevState.maxSearchResults, 
        searchByAnchorEl: null 
      }));
    }
  }
  onCloseSearchByMenu = () => this.setState({ searchByAnchorEl: null });
  onOpenSearchByMenu = e => this.setState({ searchByAnchorEl: e.currentTarget });

  renderInput = inputProps => {
    const { ref, label, ...other } = inputProps;
  
    return (
      <ThemeProvider theme={darkTheme}>
        <TextField fullWidth label={label} variant="outlined" InputProps={{ inputRef: ref, ...other }} />
      </ThemeProvider>
    );
  }

  renderSuggestionsContainer = options => {
    const { containerProps, children } = options;
  
    return (
      <Paper {...containerProps} elevation={2}>{children}</Paper>
    );
  }

  onChange = (e, { newValue }) => {
    if (this._isMounted) this.setState({ value: String(newValue) });
  }
    
  shouldRenderSuggestions = value => {
    return value && this.state.searchBy.key === 'ISBN_13' ? value.length === 13 : String(value).trim().length > 1;
  };

  onSuggestionsFetchRequested = ({ value }) => this.fetchOptions(value); // this.setState({ suggestions: this.getSuggestions(value) });

  /* getSuggestions = value => {
    const inputValue = value.normalize();
    const inputLength = inputValue.length;
    let count = 0;
  
    return inputLength === 0 ? [] : suggestions.filter(suggestion => {
      const keep = count < 5 && suggestion.label.toLowerCase().slice(0, inputLength) === inputValue;
      if (keep) { count += 1; }
      return keep;
    });
  } */

  renderSuggestion = (b, { query, isHighlighted }) => {
    const { searchBy } = this.state; 
    if (b.value) return b.value;
    const label = typeof b.label === 'object' ? String(Object.keys(b.label)[0]) : b.label
    // console.log(b.label);
    const matches = match(label, query);
    const parts = parse(label, matches);
    const searchTextHighlighted = parts.map((part, index) => part.highlight ? 
      <strong key={String(index)}>{part.text}</strong>
    :
      <span key={String(index)}>{part.text}</span>
    );
  
    return (
      <MenuItem key={b.bid} className={`menuitem-book ${match(b.label, query)}`} selected={isHighlighted} component="div">
        <div className="primaryText">
          {b.covers[0] && <img className="thumbnail" src={b.covers[0]} alt={b.title} />}
          <span className="title">
            {searchBy.key === 'title' ? searchTextHighlighted : b.title}
          </span>
        </div>
        <div className="secondaryText">
          {searchBy.key === 'title' || searchBy.key === 'author' ? Object.keys(b.authors).length ? `di ${Object.keys(b.authors)[0]}` : null : searchTextHighlighted}
        </div>
      </MenuItem>
    );
  }

  getSuggestionValue = b => b.label;

  onSuggestionsClearRequested = () => {
    clearTimeout(this.timer);
    this.setState({ suggestions: [] });
  }

  // strAsNum = str => Number(str.replace(/-|\s/g,"").trim());
  // numAsISBN_13 = num => String(num).length === 10 ? String(`978${num}`) : String(num);

  fetchOptions = value => {
    const { maxSearchResults, searchBy } = this.state;
    const { newBook, user } = this.props;
    const searchText = value.normalize();
    const searchTextType = searchBy.key === 'ISBN_13' ? Number(searchText) : 
      typeof searchText === 'object' ? String(Object.keys(searchText.split('.').join(''))[0]) : String(searchText);
    const emptyBookCTA = (
      <MenuItem className="menuitem-book empty" component="div">
        <div className="primaryText">
          <span className="title">Libro non trovato...</span>
        </div>
        <div className="secondaryText">
          <button type="button" className="btn sm flat rounded">Crea nuovo</button>
        </div>
      </MenuItem>
    );
    const emptyBook = {
      ISBN_13: searchBy.key === 'ISBN_13' ? Number(searchText) : 0,
      ISBN_10: 0,
      EDIT: {
        createdBy: (user && user.displayName) || '',
        createdByUid: (user && user.uid) || '',
        created_num: Date.now()
      },
      authors: searchBy.key === 'author' ? { searchTextType: true } : {},
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
      publisher: searchBy.key === 'publisher' ? searchText : '',
      rating_num: 0,
      ratings_num: 0,
      readers_num: 0,
      reviews_num: 0,
      subtitle: '',
      label: searchTextType, // Autosuggest OPTION LABEL
      title: searchBy.key === 'title' ? searchText : '',
      title_sort: searchBy.key === 'title' ? normalizeString(searchText) : '',
      value: emptyBookCTA
    };

    /* const existingBookCTA = (
      <MenuItem className="menuitem-book empty" component="div">
        <div className="primaryText">
          <span className="title">Libro già presente</span>
        </div>
        <div className="secondaryText">
          <button type="button" className="btn primary">Apri</button>
        </div>
      </MenuItem>
    ); */

    if (!value) return;
    
    this.timer && clearTimeout(this.timer);

    this.timer = setTimeout(() => {
      this.setState({ loading: true });
      if (newBook) {
        const searchParams = {
          q: searchText, 
          [searchBy.type]: searchTextType
        };
        // console.log(searchParams);

        // SEARCH FOR EXISTING BOOK
        if (searchBy.key === 'ISBN_13') {
          this.unsubBooksFetch = booksRef.where(searchBy.where, '==', searchTextType).limit(maxSearchResults).onSnapshot(snap => {
            // console.log({ snap });
            if (!snap.empty) {
              /* const options = [];
              snap.forEach(doc => {
                // console.log(doc.data());
                const optionLabel = searchBy.key;
                // console.log(doc.data()[optionLabel]);

                options.push({
                  ...doc.data(),
                  label: typeof doc.data()[optionLabel] === 'object' ? String(Object.keys(doc.data()[optionLabel])[0]) : doc.data()[optionLabel],
                  value: existingBookCTA
                });
              });
              this.setState({ loading: false, suggestions: options }); */

              let referrer;
              snap.forEach(doc => {
                referrer = `/book/${doc.data().bid}/${normURL(doc.data().title)}`
              });

              if (this._isMounted) {
                this.setState({ redirectToReferrer: referrer });
              }
            }
          });
        }

        fetch(booksAPIRef(searchParams), {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }).then(res => res.json()).then(json => {
          const options = [];
          if (json.items && json.items.length > 0) {
            // console.log(json.items);
            json.items.forEach(item => {
              const b = item.volumeInfo;
              const iis = b.industryIdentifiers;
              const ISBN_13 = (iis && iis.filter(ii => ii.type === 'ISBN_13')) || [];
              const ISBN_10 = (iis && iis.filter(ii => ii.type === 'ISBN_10')) || [];
              options.push({
                ISBN_13: (ISBN_13.length && Number(ISBN_13[0].identifier)) || 0,
                ISBN_10: (ISBN_10.length && Number(ISBN_10[0].identifier)) || 0,
                EDIT: {
                  createdBy: user.displayName || '',
                  createdByUid: user.uid || '',
                  created_num: Date.now()
                },
                authors: (b.authors && arrToObj(b.authors.map(author => author.split('.').join('')), item => ({ key: item, value: true }))) || {},
                bid: '',
                collections: [],
                covers: (b.imageLinks && [normalizeCover(b.imageLinks.small || b.imageLinks.thumbnail || b.imageLinks.smallThumbnail)]) || [],
                description: b.description || '',
                edition_num: 1,
                format: b.printType === 'BOOK' ? 'Libro' : b.printType === 'MAGAZINE' ? 'Rivista' : b.isEbook ? 'Ebook' : '',
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
                title_sort: normalizeString(b.title) || ''
              })
            });
          } else options.push(emptyBook);
          if (this._isMounted) {
            this.setState({ loading: false, suggestions: options });
          }
        });
      } else {
        // console.log(searchBy.key);
        let query;
        let optionLabel = searchBy.key;
        
        switch (searchBy.key) {
          case 'ISBN_13':
            query = booksRef.where(searchBy.where, '==', searchTextType); break;
          case 'author':
            query = booksRef.where(`${searchBy.where}.${capitalize(searchTextType)}`, '==', true); 
            optionLabel = String(searchBy.where); break;
          case 'publisher':
            query = booksRef.where(searchBy.where, '>=', capitalize(searchTextType)); break;
          default:
            query = booksRef.where(searchBy.where, '>=', searchTextType); break;
        };

        this.unsubQuery = query.limit(maxSearchResults).onSnapshot(snap => {
          const options = [];
          if (!snap.empty) {
            snap.forEach(doc => {
              options.push({
                ...doc.data(),
                label: typeof doc.data()[optionLabel] === 'object' ? String(Object.keys(doc.data()[optionLabel])[0]) : doc.data()[optionLabel] // Autosuggest OPTION LABEL
              });
            });
          } else options.push(emptyBook);
          if (this._isMounted) {
            this.setState({ loading: false, suggestions: options });
          }
        });
      }
    }, searchBy.key === 'ISBN_13' ? 500 : 1000);
  }

  onSuggestionSelected = (e, { suggestion, suggestionValue, suggestionIndex, /* sectionIndex, method */ }) => {
    if (suggestionIndex !== -1) {
      if (this._isMounted) this.setState({ loading: false });
      clearTimeout(this.timer);
      this.props.onBookSelect(suggestion);
    } else console.warn('Suggestion not found');
  }

  render() {
    const { loading, redirectToReferrer, searchBy, searchByAnchorEl, suggestions, value } = this.state;
    const { newBook } = this.props;
    const options = searchByOptions.map(option => (
      <MenuItem 
        key={option.type} 
        value={option}
        selected={option.type === searchBy.type}
        onClick={() => this.onClickSearchBy(option)}>
        {option.label}
      </MenuItem>
    ));

    if (redirectToReferrer) return <Redirect to={redirectToReferrer} />

    return (
      <div className="container sm search-book-container">
        <div className="form-group customScrollbar">
          {loading && <div aria-hidden="true" className="loader"><CircularProgress style={{ height: 30, width: 30, }} /></div>}

          <Autosuggest
            // alwaysRenderSuggestions={true}
            renderInputComponent={this.renderInput}
            suggestions={suggestions}
            shouldRenderSuggestions={this.shouldRenderSuggestions}
            onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
            onSuggestionsClearRequested={this.onSuggestionsClearRequested}
            renderSuggestionsContainer={this.renderSuggestionsContainer}
            getSuggestionValue={this.getSuggestionValue}
            renderSuggestion={this.renderSuggestion}
            onSuggestionSelected={this.onSuggestionSelected}
            inputProps={{
              className: 'input-field',
              type: searchBy.key === 'ISBN_13' ? 'number' : 'text',
              label: `${newBook ? 'Aggiungi libro' : 'Cerca libro'} per ${searchBy.label}`,
              placeholder: `Es: ${searchBy.hint}`,
              value,
              onChange: this.onChange,
              endAdornment: <button type="button" className="btn sm flat search-by" onClick={this.onOpenSearchByMenu}>{searchBy.label}</button>
            }}
          />
          {/* searchBy.key === 'ISBN_13' && Number.isNaN(Number(value)) && <FormHelperText className="message error">Solo numeri</FormHelperText> */}
          {searchBy.key === 'ISBN_13' && !Number.isNaN(Number(value)) && (
            <ThemeProvider theme={darkTheme}>
              <FormHelperText className={`message ${value.length === 13 ? 'success' : value.length > 13 ? 'error' : 'helper'}`}>
                {value.length} di 13 cifre
              </FormHelperText>
            </ThemeProvider>
          )}

          <ThemeProvider theme={defaultTheme}>
            <Menu 
              className="dropdown-menu" 
              anchorEl={searchByAnchorEl} 
              open={Boolean(searchByAnchorEl)} 
              onClose={this.onCloseSearchByMenu}>
              {options}
            </Menu>
          </ThemeProvider>
        </div>
      </div>
    )
  }
}