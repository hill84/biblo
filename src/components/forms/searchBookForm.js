import CircularProgress from '@material-ui/core/CircularProgress';
import FormHelperText from '@material-ui/core/FormHelperText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import { ThemeProvider } from '@material-ui/styles';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import React, { useContext, useEffect, useRef, useState } from 'react';
import Autosuggest from 'react-autosuggest';
import { Redirect } from 'react-router-dom';
import { booksAPIRef } from '../../config/API';
import { booksRef } from '../../config/firebase';
import { arrToObj, capitalizeInitials, normalizeCover, normalizeString, normURL, switchGenres, switchLanguages } from '../../config/shared';
import { darkTheme, defaultTheme } from '../../config/themes';
import { boolType, funcType } from '../../config/types';
import UserContext from '../../context/userContext';
import '../../css/searchBook.css';

const searchByOptions = [
  { key: 'title', type: 'intitle', label: 'Titolo', hint: 'Sherlock Holmes', where: 'title_sort' },
  { key: 'ISBN_13', type: 'isbn', label: 'ISBN', hint: '9788854152601', where: 'ISBN_13' },
  { key: 'author', type: 'inauthor', label: 'Autore', hint: 'Arthur Conan Doyle', where: 'authors' },
  { key: 'publisher', type: 'inpublisher', label: 'Editore', hint: 'Newton Compton', where: 'publisher' }
];

const unsub = {
  timer: null,
  booksFetch: null,
  query: null
};

const limit = 30;

const SearchBookForm = props => {
  const { user } = useContext(UserContext);
  const { newBook, onBookSelect } = props;
  const [searchByAnchorEl, setSearchByAnchorEl] = useState(null);
  const [searchBy, setSearchBy] = useState(searchByOptions[0]);
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [maxSearchResults, setMaxSearchResults] = useState(limit);
  const [suggestions, setSuggestions] = useState([]);
  const [redirectToReferrer, setRedirectToReferrer] = useState('');
  const is = useRef(true);

  useEffect(() => {
    setValue('');
  }, [searchBy.key]);

  useEffect(() => () => {
    is.current = false;
    unsub.timer && clearTimeout(unsub.timer);
    unsub.booksFetch && unsub.booksFetch();
    unsub.query && unsub.query();
  }, []);

  // const onClickSearch = option => setSearchBy(option);
  // const onCloseSearchMenu = () => setSearchAnchorEl(null);
  // const onOpenSearchMenu = e => setSearchAnchorEl(e.currentTarget);

  const onClickSearchBy = option => {
    if (is.current) {
      setSearchBy(option); 
      setMaxSearchResults(option.key === 'ISBN_13' ? 1 : maxSearchResults); 
      setSearchByAnchorEl(null);
    }
  };
  const onCloseSearchByMenu = () => setSearchByAnchorEl(null);
  const onOpenSearchByMenu = e => setSearchByAnchorEl(e.currentTarget);

  const renderInput = inputProps => {
    const { ref, label, ...other } = inputProps;
  
    return (
      <ThemeProvider theme={darkTheme}>
        <TextField fullWidth label={label} variant="outlined" InputProps={{ inputRef: ref, ...other }} />
      </ThemeProvider>
    );
  };

  const renderSuggestionsContainer = options => {
    const { containerProps, children } = options;
  
    return (
      <Paper {...containerProps} elevation={2}>{children}</Paper>
    );
  };

  const onChange = (e, { newValue }) => {
    if (is.current) setValue(String(newValue));
  };
    
  const shouldRenderSuggestions = value => {
    return value && searchBy.key === 'ISBN_13' ? value.length === 13 : String(value).trim().length > 1;
  };

  const onSuggestionsFetchRequested = ({ value }) => fetchOptions(value); // setSuggestions(getSuggestions(value));

  /* const getSuggestions = value => {
    const inputValue = value.normalize();
    const inputLength = inputValue.length;
    let count = 0;
  
    return inputLength === 0 ? [] : suggestions.filter(suggestion => {
      const keep = count < 5 && suggestion.label.toLowerCase().slice(0, inputLength) === inputValue;
      if (keep) { count += 1; }
      return keep;
    });
  }; */

  const renderSuggestion = (b, { query, isHighlighted }) => { 
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

  const getSuggestionValue = b => b.label;

  const onSuggestionsClearRequested = () => {
    unsub.timer && clearTimeout(unsub.timer);
    setSuggestions([]);
  }

  // const strAsNum = str => Number(str.replace(/-|\s/g,"").trim());
  // const numAsISBN_13 = num => String(num).length === 10 ? String(`978${num}`) : String(num);
  
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

  const fetchOptions = value => {
    const searchText = value.normalize();
    const searchTextType = searchBy.key === 'ISBN_13' ? Number(searchText) : 
      typeof searchText === 'object' ? String(Object.keys(searchText.split('.').join(''))[0]) : String(searchText);
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
    
    unsub.timer && clearTimeout(unsub.timer);

    unsub.timer = setTimeout(() => {
      setLoading(true);

      if (newBook) {
        const searchParams = {
          q: searchText, 
          [searchBy.type]: searchTextType
        };
        // console.log(searchParams);

        // SEARCH FOR EXISTING BOOK
        if (searchBy.key === 'ISBN_13') {
          unsub.booksFetch = booksRef.where(searchBy.where, '==', searchTextType).limit(maxSearchResults).onSnapshot(snap => {
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
              setLoading(false);
              setSuggestions(options); */

              let referrer;
              snap.forEach(doc => {
                referrer = `/book/${doc.data().bid}/${normURL(doc.data().title)}`
              });

              setRedirectToReferrer(referrer);
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
          if (is.current) {
            setLoading(false);
            setSuggestions(options);
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
            query = booksRef.where(`${searchBy.where}.${capitalizeInitials(searchTextType.toLowerCase())}`, '==', true); 
            optionLabel = String(searchBy.where); break;
          case 'publisher':
            query = booksRef.where(searchBy.where, '>=', capitalizeInitials(searchTextType.toLowerCase())); break;
          default:
            query = booksRef.where(searchBy.where, '>=', searchTextType.toLowerCase()); break;
        };

        unsub.query = query.limit(maxSearchResults).onSnapshot(snap => {
          const options = [];
          if (!snap.empty) {
            snap.forEach(doc => {
              options.push({
                ...doc.data(),
                label: typeof doc.data()[optionLabel] === 'object' ? String(Object.keys(doc.data()[optionLabel])[0]) : doc.data()[optionLabel] // Autosuggest OPTION LABEL
              });
            });
          } else options.push(emptyBook);
          if (is.current) {
            setLoading(false);
            setSuggestions(options);
          }
        });
      }
    }, searchBy.key === 'ISBN_13' ? 500 : 1000);
  };

  const onSuggestionSelected = (e, {
    suggestion,
    suggestionValue,
    suggestionIndex,
    // sectionIndex,
    // method
  }) => {
    if (suggestionIndex !== -1) {
      if (is.current) setLoading(false);
      unsub.timer && clearTimeout(unsub.timer);
      onBookSelect(suggestion);
    } else console.warn('Suggestion not found');
  };
  
  const options = searchByOptions.map(option => (
    <MenuItem 
      key={option.type} 
      value={option}
      selected={option.type === searchBy.type}
      onClick={() => onClickSearchBy(option)}>
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
          renderInputComponent={renderInput}
          suggestions={suggestions}
          shouldRenderSuggestions={shouldRenderSuggestions}
          onSuggestionsFetchRequested={onSuggestionsFetchRequested}
          onSuggestionsClearRequested={onSuggestionsClearRequested}
          renderSuggestionsContainer={renderSuggestionsContainer}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          onSuggestionSelected={onSuggestionSelected}
          inputProps={{
            className: 'input-field',
            type: searchBy.key === 'ISBN_13' ? 'number' : 'text',
            label: `${newBook ? 'Aggiungi libro' : 'Cerca libro'} per ${searchBy.label.toLowerCase()}`,
            placeholder: `Es: ${searchBy.hint}`,
            value,
            onChange: onChange,
            endAdornment: <button type="button" className="btn sm flat search-by" onClick={onOpenSearchByMenu}>{searchBy.label}</button>
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
            onClose={onCloseSearchByMenu}>
            {options}
          </Menu>
        </ThemeProvider>
      </div>
    </div>
  );
}

SearchBookForm.propTypes = {
  newBook: boolType,
  onBookSelect: funcType
}

SearchBookForm.defaultProps = {
  newBook: false,
  onBookSelect: null
}
 
export default SearchBookForm;