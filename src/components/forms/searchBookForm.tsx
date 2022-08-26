import { DocumentData } from '@firebase/firestore-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormHelperText from '@material-ui/core/FormHelperText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import { ThemeProvider } from '@material-ui/styles';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import classnames from 'classnames';
import React, { FC, FormEvent, MouseEvent, useContext, useEffect, useRef, useState } from 'react';
import Autosuggest, { ChangeEvent, InputProps, RenderInputComponentProps, RenderSuggestionParams, RenderSuggestionsContainerParams, SuggestionSelectedEventData, SuggestionsFetchRequestedParams } from 'react-autosuggest';
import { Redirect } from 'react-router-dom';
import { IndustryIdentifier, SearchParamsModel, VolumeInfo, VolumeModel } from '../../booksAPITypes';
import { booksAPIRef } from '../../config/API';
import { booksRef } from '../../config/firebase';
import { capitalizeInitials, normalizeAuthors, normalizeCover, normalizeFormat, normalizeString, normURL, switchGenres, switchLanguages } from '../../config/shared';
import { darkTheme, defaultTheme } from '../../config/themes';
import UserContext from '../../context/userContext';
import '../../css/searchBook.css';
import { BookModel, SearchByModel, UserContextModel } from '../../types';

interface SuggestionModel extends BookModel {
  label: string | number;
  value?: JSX.Element;
}

const searchByOptions: SearchByModel[] = [
  { key: 'title', type: 'intitle', label: 'Titolo', hint: 'Sherlock Holmes', where: 'title_sort' },
  { key: 'ISBN_13', type: 'isbn', label: 'ISBN', hint: '9788854152601', where: 'ISBN_13' },
  { key: 'author', type: 'inauthor', label: 'Autore', hint: 'Arthur Conan Doyle', where: 'authors' },
  { key: 'publisher', type: 'inpublisher', label: 'Editore', hint: 'Newton Compton', where: 'publisher' }
];

let timer: null | number = null;
let booksFetch: (() => void) | null = null;
let query: (() => void) | null = null;

const limit = 33;

interface SearchBookFormProps {
  newBook?: boolean;
  onBookSelect: (book: BookModel) => void;
}

const SearchBookForm: FC<SearchBookFormProps> = ({
  newBook,
  onBookSelect,
}: SearchBookFormProps) => {
  const { user } = useContext<UserContextModel>(UserContext);
  const [searchByAnchorEl, setSearchByAnchorEl] = useState<EventTarget & HTMLButtonElement | null>(null);
  const [searchBy, setSearchBy] = useState<SearchByModel>(searchByOptions[0]);
  const [value, setValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [maxSearchResults, setMaxSearchResults] = useState<number>(limit);
  const [suggestions, setSuggestions] = useState<SuggestionModel[]>([]);
  const [redirectToReferrer, setRedirectToReferrer] = useState<string>('');
  const is = useRef(true);

  useEffect(() => {
    setValue('');
  }, [searchBy.key]);

  useEffect(() => () => {
    is.current = false;
    timer && clearTimeout(timer);
    booksFetch?.();
    query?.();
  }, []);

  // const onClickSearch = option => setSearchBy(option);
  // const onCloseSearchMenu = () => setSearchAnchorEl(null);
  // const onOpenSearchMenu = e => setSearchAnchorEl(e.currentTarget);

  const onClickSearchBy = (option: SearchByModel): void => {
    if (!is.current) return;
    setSearchBy(option); 
    setMaxSearchResults(option.key === 'ISBN_13' ? 1 : limit); 
    setSearchByAnchorEl(null);
  };
  const onCloseSearchByMenu = (): void => setSearchByAnchorEl(null);
  const onOpenSearchByMenu = (e: MouseEvent<HTMLButtonElement>): void => setSearchByAnchorEl(e.currentTarget);

  interface ExtendedRenderInputComponentProps extends RenderInputComponentProps {
    label: string;
  }

  const renderInput = (inputProps: RenderInputComponentProps) => {
    const { ref, label, ...other } = inputProps as ExtendedRenderInputComponentProps; // CHECK

    const props: Object = { inputRef: ref, ...other };
  
    return (
      <ThemeProvider theme={darkTheme}>
        <TextField fullWidth label={label} variant='outlined' InputProps={props} />
      </ThemeProvider>
    );
  };

  const renderSuggestionsContainer = (options: RenderSuggestionsContainerParams) => {
    const { containerProps, children } = options;
  
    return (
      <Paper {...containerProps} elevation={2}>{children}</Paper>
    );
  };

  const onChange = (_e: FormEvent<HTMLElement>, params: ChangeEvent): void => {
    const { newValue } = params;
    if (is.current) setValue(newValue);
  };
    
  const shouldRenderSuggestions = (value: string): boolean => {
    const trimmedValue: string = value.trim();
    return trimmedValue && searchBy.key === 'ISBN_13' ? trimmedValue.length === 13 : trimmedValue.length > 1;
  };

  const emptyBookCTA = (
    <MenuItem className='menuitem-book empty' component='div'>
      <div className='primaryText'>
        <span className='title'>Libro non trovato...</span>
      </div>
      {newBook && (
        <div className='secondaryText'>
          <button type='button' className='btn sm flat rounded'>Crea nuovo</button>
        </div>
      )}
    </MenuItem>
  );

  const fetchOptions = (value: string): void => {
    const searchText: string = value.trim();
    const searchTextType: string | number = searchBy.key === 'ISBN_13' ? Number(searchText) || 0 : searchText;
    // searchBy.key === 'ISBN_13' ? Number(searchText) || 0 : typeof searchText === 'object' ? String(Object.keys(String(searchText).split('.').join(''))[0]) : String(searchText);
    
    const emptyBook: SuggestionModel = {
      ISBN_13: searchBy.key === 'ISBN_13' ? Number(searchText) : 0,
      ISBN_10: 0,
      EDIT: {
        createdBy: user?.displayName || '',
        createdByUid: user?.uid || '',
        created_num: Date.now(),
        edit: true, 
        lastEditBy: '', 
        lastEditByUid: '', 
        lastEdit_num: 0,
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
      trailerURL: '',
      label: searchTextType, // Autosuggest OPTION LABEL
      title: searchBy.key === 'title' ? searchText : '',
      title_sort: searchBy.key === 'title' ? normalizeString(searchText) : '',
      value: emptyBookCTA,
    };

    /* const existingBookCTA = (
      <MenuItem className='menuitem-book empty' component='div'>
        <div className='primaryText'>
          <span className='title'>Libro già presente</span>
        </div>
        <div className='secondaryText'>
          <button type='button' className='btn primary'>Apri</button>
        </div>
      </MenuItem>
    ); */

    if (!value) return;
    
    timer && clearTimeout(timer);

    timer = window.setTimeout(() => {
      setLoading(true);

      if (newBook) {
        const searchParams: SearchParamsModel = {
          q: searchText, 
          [searchBy.type]: searchTextType
        };
        // console.log(searchParams);

        // SEARCH FOR EXISTING BOOK
        if (searchBy.key === 'ISBN_13') {
          booksFetch = booksRef.where(searchBy.where, '==', searchTextType).limit(maxSearchResults).onSnapshot((snap: DocumentData): void => {
            // console.log({ snap });
            if (!snap.empty) {
              /* const options = [];
              snap.forEach((doc: DocumentData) => {
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

              let referrer = '';
              snap.forEach((doc: DocumentData) => {
                referrer = `/book/${doc.data().bid}/${normURL(doc.data().title)}`;
              });

              setRedirectToReferrer(referrer);
            }
          });
        }

        fetch(booksAPIRef(searchParams), {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }).then((res: Response) => res.json()).then(({ items }: { items: VolumeModel[] }): void => {
          const options: SuggestionModel[] = [];
          if (items?.length > 0) {
            // console.log(json.items);
            items.forEach((item: VolumeModel): void => {
              const b: VolumeInfo = item.volumeInfo;
              const iis: IndustryIdentifier[] = b?.industryIdentifiers;
              const ISBN_13: IndustryIdentifier[] = (iis?.filter(({ type }: IndustryIdentifier): boolean => type === 'ISBN_13')) || [];
              const ISBN_10: IndustryIdentifier[] = (iis?.filter(({ type }: IndustryIdentifier): boolean => type === 'ISBN_10')) || [];
              options.push({
                ISBN_13: Number(ISBN_13[0]?.identifier) || 0,
                ISBN_10: Number(ISBN_10[0]?.identifier) || 0,
                EDIT: {
                  createdBy: user?.displayName || '',
                  createdByUid: user?.uid || '',
                  created_num: Date.now(),
                  edit: true, 
                  lastEditBy: '', 
                  lastEditByUid: '', 
                  lastEdit_num: 0,
                },
                authors: normalizeAuthors(b.authors),
                bid: '',
                collections: [],
                covers: (b.imageLinks && [normalizeCover(b.imageLinks.small || b.imageLinks.thumbnail || b.imageLinks.smallThumbnail)]) || [],
                description: b.description || '',
                edition_num: 1,
                format: normalizeFormat(b.printType, b.isEbook),
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
                trailerURL: '',
                label: b.title || '', // Autosuggest OPTION LABEL
                title: b.title || '',
                title_sort: normalizeString(b.title) || ''
              });
            });
          } else options.push(emptyBook);
          if (is.current) {
            setLoading(false);
            setSuggestions(options);
          }
        });
      } else {
        // console.log(searchBy.key);
        let queryRef;
        let optionLabel = searchBy.key;

        switch (searchBy.key) {
          case 'ISBN_13':
            queryRef = booksRef.where(searchBy.where, '==', searchTextType); break;
          case 'author':
            queryRef = booksRef.where(`${searchBy.where}.${capitalizeInitials(String(searchTextType).toLowerCase())}`, '==', true); 
            optionLabel = String(searchBy.where); break;
          case 'publisher':
            queryRef = booksRef.where(searchBy.where, '>=', capitalizeInitials(String(searchTextType).toLowerCase())); break;
          default: // 'title'
            queryRef = booksRef.where(searchBy.where, '>=', normalizeString(String(searchTextType))); break;
        }

        query = queryRef.limit(maxSearchResults).onSnapshot(snap => {
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
        }, err => console.warn(err));
      }
    }, searchBy.key === 'ISBN_13' ? 500 : 1000);
  };

  const onSuggestionsFetchRequested = ({ value }: SuggestionsFetchRequestedParams): void => fetchOptions(value);

  const renderSuggestion = (b: SuggestionModel, { query, isHighlighted }: RenderSuggestionParams) => { 
    if (b.value) return b.value;
    const label: string | number = typeof b.label === 'object' ? String(Object.keys(b.label)[0]) : b.label;
    // console.log(b.label);
    type PartModel = { text: string; highlight: boolean };
    const matches: Array<[number, number]> = match(String(label), query);
    const parts: PartModel[] = parse(String(label), matches);
    const searchTextHighlighted = parts.map((part: PartModel, index: number) => part.highlight ? (
      <strong key={String(index)}>{part.text}</strong>
    ) : (
      <span key={String(index)}>{part.text}</span>
    ));
  
    return (
      <MenuItem key={b.bid} className={classnames('menuitem-book', match(String(b.label), query))} selected={isHighlighted} component='div'>
        <div className='primaryText'>
          {b.covers[0] && <img className='thumbnail' src={b.covers[0]} alt={b.title} />}
          <span className='title'>
            {searchBy.key === 'title' ? searchTextHighlighted : b.title}
          </span>
        </div>
        <div className='secondaryText'>
          {searchBy.key === 'title' || searchBy.key === 'author' ? Object.keys(b.authors).length ? `di ${Object.keys(b.authors)[0]}` : null : searchTextHighlighted}
        </div>
      </MenuItem>
    );
  };

  const getSuggestionValue = (b: SuggestionModel): string => String(b.label);

  const onSuggestionsClearRequested = (): void => {
    timer && clearTimeout(timer);
    setSuggestions([]);
  };

  // const strAsNum = str => Number(str.replace(/-|\s/g,'').trim());
  // const numAsISBN_13 = num => String(num).length === 10 ? String(`978${num}`) : String(num);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSuggestionSelected = (_e: FormEvent<any>, data: SuggestionSelectedEventData<SuggestionModel>) => {
    const { suggestion, suggestionIndex } = data;
    if (suggestionIndex !== -1) {
      if (is.current) setLoading(false);
      timer && clearTimeout(timer);
      onBookSelect(suggestion);
    } else console.warn('Suggestion not found');
  };
  
  const options = searchByOptions.map((option: SearchByModel) => (
    <MenuItem 
      key={option.type} 
      value={option.type} // CHECK
      selected={option.type === searchBy.type}
      onClick={() => onClickSearchBy(option)}>
      {option.label}
    </MenuItem>
  ));

  interface ExtendedInputProps extends InputProps<SuggestionModel> {
    label: string;
    endAdornment: JSX.Element;
  }

  const inputProps: ExtendedInputProps = {
    className: 'input-field',
    type: searchBy.key === 'ISBN_13' ? 'number' : 'text',
    label: `${newBook ? 'Aggiungi' : 'Cerca'} libro per ${searchBy.label.toLowerCase()}`,
    placeholder: `Es: ${searchBy.hint}`,
    value,
    onChange,
    endAdornment: <button type='button' className='btn sm flat search-by' onClick={onOpenSearchByMenu}>{searchBy.label}</button>
  }; // CHECK

  if (redirectToReferrer) return <Redirect to={redirectToReferrer} />;

  return (
    <div className='container sm search-book-container'>
      <div className='form-group customScrollbar'>
        {loading && <div aria-hidden='true' className='loader'><CircularProgress style={{ height: 30, width: 30, }} /></div>}

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
          inputProps={inputProps}
        />
        {/* searchBy.key === 'ISBN_13' && Number.isNaN(Number(value)) && <FormHelperText className='message error'>Solo numeri</FormHelperText> */}
        {searchBy.key === 'ISBN_13' && !Number.isNaN(Number(value)) && (
          <ThemeProvider theme={darkTheme}>
            <FormHelperText className={classnames('message', value.length === 13 ? 'success' : value.length > 13 ? 'error' : 'helper')}>
              {value.length} di 13 cifre
            </FormHelperText>
          </ThemeProvider>
        )}

        <ThemeProvider theme={defaultTheme}>
          <Menu 
            className='dropdown-menu' 
            anchorEl={searchByAnchorEl} 
            open={Boolean(searchByAnchorEl)} 
            onClose={onCloseSearchByMenu}>
            {options}
          </Menu>
        </ThemeProvider>
      </div>
    </div>
  );
};
 
export default SearchBookForm;