import { RolesModel, StatsModel, UserModel } from 'src/types';
import { abbrNum, app, arrToObj, calcAge, calcVulgarity, capitalize, capitalizeInitials, checkBadWords, denormURL, diffDates, enrichText, extractMentions, extractMuids, extractRefs, extractUrls, getInitials, hasRole, join, joinObj, joinToLowerCase, msToDuration, normalizeAuthor, normalizeAuthors, normalizeCover, normalizeString, normURL, round, splitWords, timeSince, truncateString, validateImg } from '../shared';

// JUNCTION

describe('Given an array of strings', () => {
  it('should return an expected joined string', () => {
    expect(join([])).toStrictEqual('');
    expect(join(['uno'])).toStrictEqual('uno');
    expect(join(['uno', 'due'])).toStrictEqual('uno e due');
    expect(join(['uno', 'due', 'tre'])).toStrictEqual('uno, due e tre');
    expect(join(['uno', 'due', 'tre', 'QUATTRO'])).toStrictEqual('uno, due, tre e QUATTRO');
  });
});

describe('Given an array of objects', () => {
  it('should return an expected joined string', () => {
    expect(joinObj({})).toStrictEqual('');
    expect(joinObj({ uno: true })).toStrictEqual('uno');
    expect(joinObj({ uno: true, due: null })).toStrictEqual('uno e due');
    expect(joinObj({ uno: true, due: null, tre: 'tre' })).toStrictEqual('uno, due e tre');
    expect(joinObj({ uno: true, due: null, tre: 'tre', QUATTRO: 4 })).toStrictEqual('uno, due, tre e QUATTRO');
  });
});

describe('Given an array of strings', () => {
  it('should return an expected joined lowercase string', () => {
    expect(joinToLowerCase([])).toStrictEqual('');
    expect(joinToLowerCase(['UNO'])).toStrictEqual('uno');
    expect(joinToLowerCase(['UNO', 'DUE'])).toStrictEqual('uno e due');
    expect(joinToLowerCase(['UNO', 'DUE', 'TRE'])).toStrictEqual('uno, due e tre');
    expect(joinToLowerCase(['UNO', 'DUE', 'TRE', 'QUATTRO'])).toStrictEqual('uno, due, tre e quattro');
  });
});

// UTILITY

describe('Given a string', () => {
  it('should return an expected array of strings', () => {
    expect(splitWords('')).toStrictEqual(['']);
    expect(splitWords('one two,three.four;five:six@seven!eight?nine"ten')).toStrictEqual(['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']);
    expect(splitWords('one<two>three\'four«five»six(seven)eight/nine|ten')).toStrictEqual(['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']);
    expect(splitWords('one+two-three/four–five=six_seven')).toStrictEqual(['one', 'two', 'three', 'four', 'five', 'six', 'seven']);
  });
});

describe('Given a string', () => {
  it('should return an expected string of initials', () => {
    expect(getInitials('')).toStrictEqual('');
    expect(getInitials('John Ronald Reuel Tolkien')).toStrictEqual('JRRT');
    expect(getInitials('john ronald reuel tolkien')).toStrictEqual('jrrt');
    expect(getInitials('J. R. R. Tolkien')).toStrictEqual('JRRT');
    expect(getInitials('J.R.R. Tolkien')).toStrictEqual('JT');
  });
});

describe('Given an array and an iterative function', () => {
  it('should return an expected object', () => {
    const fn = (item: boolean): object => ({ key: item, value: true });
    expect(arrToObj([], fn)).toStrictEqual({});
    expect(arrToObj(['one', 'two'], fn)).toStrictEqual({ one: true , two: true });
    expect(arrToObj(['one', 1, null, undefined, true, {}, []], fn)).toStrictEqual({ one: true, 1: true, });
  });
});

describe('Given a string', () => {
  it('should return an expected truncated string', () => {
    const string = 'lorem ipsum dolor sit amet';
    expect(truncateString('')).toStrictEqual('');
    expect(truncateString(string)).toStrictEqual(string);
    expect(truncateString(string, 0)).toStrictEqual('…');
    expect(truncateString(string, 5)).toStrictEqual('lorem…');
    expect(truncateString('lorem', 5)).toStrictEqual('lorem');
  });
});

describe('Given a string', () => {
  it('should return an expected string', () => {
    const string = 'Ray Bradbury';
    expect(normURL(undefined)).toStrictEqual('');
    expect(normURL('')).toStrictEqual('');
    expect(normURL(string)).toStrictEqual('Ray_Bradbury');
  });
});

describe('Given a URL', () => {
  it('should return an expected string', () => {
    const url = 'Ray_Bradbury';
    expect(denormURL(undefined)).toStrictEqual('');
    expect(denormURL('')).toStrictEqual('');
    expect(denormURL(url)).toStrictEqual('Ray Bradbury');
  });
});

describe('Given a user and a role', () => {
  it('should return if has given role', () => {
    const roles: RolesModel = {
      admin: false,
      author: false,
      editor: true,
      premium: false,
    };

    const stats: StatsModel = {
      ratings_num: 0,
      reviews_num: 0,
      shelf_num: 0,
      wishlist_num: 0,
    };

    const basicUser: UserModel = {
      creationTime: 0,
      uid: 'UID',
      displayName: 'DISPLAY_NAME',
      email: 'EMAIL',
      birth_date: 0,
      continent: 'CONTINENT',
      country: 'COUNTRY',
      city: 'CITY',
      languages: ['LANGUAGE'],
      photoURL: 'PHOTO_URL',
      sex: 'SEX',
      roles,
      stats,
    };

    const user: UserModel = {
      ...basicUser,
      privacyAgreement: 0,
      termsAgreement: 0,
      website: 'WEBSITE',
      youtube: 'YOUTUBE',
      instagram: 'INSTAGRAM',
      twitch: 'TWITCH',
      facebook: 'FACEBOOK',
    };

    expect(hasRole(user, 'admin')).toStrictEqual(false);
    expect(hasRole(user, 'author')).toStrictEqual(false);
    expect(hasRole(user, 'editor')).toStrictEqual(true);
    expect(hasRole(user, 'premium')).toStrictEqual(false);
  });
});

describe('Given a string', () => {
  it('should return if match urlRegex', () => {
    expect(extractUrls('Lorem https://www.website.com ipsum')).toStrictEqual(['https://www.website.com']);
    expect(extractUrls('Lorem http://website.com ipsum')).toStrictEqual(['http://website.com']);
    expect(extractUrls('Lorem www.website.com ipsum')).toStrictEqual(['www.website.com']);
    expect(extractUrls('Lorem website.com ipsum')).toStrictEqual(['website.com']);
    expect(extractUrls('Lorem ipsum')).toStrictEqual(null);
    expect(extractUrls('')).toStrictEqual(null);
  });
});

const um = {
  ref: 'dashboard',
  id: 'AB12dcd',
  name: 'User_Name',
};

const userMention = `@${um.ref}/${um.id}/${um.name}`;

const bm = {
  ref: 'book',
  id: 'EF34dgh',
  title: 'Book_Title',
};

const bookMention = `@${bm.ref}/${bm.id}/${bm.title}`;

const am = {
  ref: 'author',
  id: 'IJ56kl',
  name: 'Author_Name',
};

const authorMention = `@${am.ref}/${am.id}/${am.name}`;

const cm = {
  ref: 'collection',
  id: 'MN78op',
  title: 'Collection_Title',
};

const collectionMention = `@${cm.ref}/${cm.id}/${cm.title}`;

describe('Given a string', () => {
  it('should return mention refs', () => {
    expect(extractRefs(`Lorem ${userMention} ipsum`)).toStrictEqual([userMention]);
    expect(extractRefs(`Lorem ${bookMention} ipsum`)).toStrictEqual([bookMention]);
    expect(extractRefs(`Lorem ${authorMention} ipsum`)).toStrictEqual([authorMention]);
    expect(extractRefs(`Lorem ${collectionMention} ipsum`)).toStrictEqual([collectionMention]);
    expect(extractRefs('Lorem ipsum')).toStrictEqual(null);
    expect(extractRefs('')).toStrictEqual(null);
  });
});

describe('Given a string', () => {
  it('should return mentions', () => {
    expect(extractMentions(`Lorem ${userMention} ipsum`)).toStrictEqual([userMention]);
    expect(extractMentions('Lorem ipsum')).toStrictEqual(undefined);
    expect(extractMentions('')).toStrictEqual(undefined);
  });
});

describe('Given a string', () => {
  it('should return mention ids', () => {
    expect(extractMuids(`Lorem ${userMention} ipsum`)).toStrictEqual([um.id]);
    expect(extractMuids('Lorem ipsum')).toStrictEqual([]);
    expect(extractMuids('')).toStrictEqual([]);
  });
});

// INTERPOLATION

describe('Given a string', () => {
  it('should return an expected enriched string', () => {
    const expectedResult = {
      user: `Lorem <a title="${userMention}" href="${app.url}/${um.ref}/${um.id}/${um.name}">${denormURL(um.name)}</a> ipsum`,
      book: `Lorem <a title="${bookMention}" href="${app.url}/${bm.ref}/${bm.id}/${bm.title}">${denormURL(bm.title)}</a> ipsum`,
      author: `Lorem <a title="${authorMention}" href="${app.url}/${am.ref}/${am.id}/${am.name}">${denormURL(am.name)}</a> ipsum`,
      collection: `Lorem <a title="${collectionMention}" href="${app.url}/${cm.ref}/${cm.id}/${cm.title}">${denormURL(cm.title)}</a> ipsum`,
    };

    expect(enrichText(`Lorem ${userMention} ipsum`)).toStrictEqual(expectedResult.user);
    expect(enrichText(`Lorem ${bookMention} ipsum`)).toStrictEqual(expectedResult.book);
    expect(enrichText(`Lorem ${authorMention} ipsum`)).toStrictEqual(expectedResult.author);
    expect(enrichText(`Lorem ${collectionMention} ipsum`)).toStrictEqual(expectedResult.collection);
    expect(enrichText('Lorem ipsum')).toStrictEqual('Lorem ipsum');
    expect(enrichText('')).toStrictEqual('');
  });
});

// VALIDATION

describe('Given a File', () => {
  it('should return an error string if is not a valid image', () => {
    expect(validateImg(undefined)).toStrictEqual('File non trovato');
    expect(validateImg({ type: '_UNEXPECTED_' } as File)).toStrictEqual('Tipo file non valido: _UNEXPECTED_');
    expect(validateImg({ type: 'image.*' } as File)).toStrictEqual('');
    expect(validateImg({ type: 'image.*', size: 1048577 } as File)).toStrictEqual('File troppo pesante. Max 1MB.');
    expect(validateImg({ type: 'image.*', size: 1048577 } as File, 1048578)).toStrictEqual('');
  });
});

describe('Given a string', () => {
  it('should return true if contains some bad word', () => {
    expect(checkBadWords('lorem fucking ipsum')).toBeTruthy();
    expect(checkBadWords('lorem ipsum')).toBeFalsy();
    expect(checkBadWords('')).toBeFalsy();
  });
});

describe('Given a string', () => {
  it('should return the count of bad words', () => {
    expect(calcVulgarity('lorem fucking ipsum')).toStrictEqual(1);
    expect(calcVulgarity('lorem ipsum')).toStrictEqual(0);
    expect(calcVulgarity('')).toStrictEqual(0);
  });
});

// NORMALIZATION

describe('Given a string', () => {
  it('should return an expected normalized string', () => {
    expect(normalizeString('lorem ipsum')).toStrictEqual('lorem-ipsum');
    expect(normalizeString('lorem--ipsum')).toStrictEqual('lorem-ipsum');
    expect(normalizeString(' lorem  ipsum ')).toStrictEqual('lorem-ipsum');
    expect(normalizeString('àáâãäå')).toStrictEqual('aaaaaa');
    expect(normalizeString('èéêë')).toStrictEqual('eeee');
    expect(normalizeString('ìíîï')).toStrictEqual('iiii');
    expect(normalizeString('òóôõö')).toStrictEqual('ooooo');
    expect(normalizeString('ùúûü')).toStrictEqual('uuuu');
    expect(normalizeString('ýÿ')).toStrictEqual('yy');
    expect(normalizeString('æœçñ')).toStrictEqual('aeoecn');
    expect(normalizeString('_')).toStrictEqual('_');
    expect(normalizeString('')).toStrictEqual('');
  });
});

describe('Given a string', () => {
  it('should return an expected normalized author string', () => {
    expect(normalizeAuthor('aavv')).toStrictEqual('AAVV');
    expect(normalizeAuthor('john ronald reuel tolkien')).toStrictEqual('John Ronald Reuel Tolkien');
    expect(normalizeAuthor('J. R. R. Tolkien')).toStrictEqual('J R R Tolkien'); // TODO: remove spaces between initials?
    expect(normalizeAuthor(undefined)).toStrictEqual('');
  });
});

describe('Given a string', () => {
  it('should return an expected array of normalized author strings', () => {
    expect(normalizeAuthors(['Umberto Eco'])).toStrictEqual({ 'Umberto Eco': true }); // TODO: remove spaces between initials?
    expect(normalizeAuthors([''])).toStrictEqual({});
    expect(normalizeAuthors([])).toStrictEqual({});
  });
});

describe('Given a string', () => {
  it('should return an expected normalized cover string', () => {
    expect(normalizeCover('http://url&edge=curl')).toStrictEqual('//url');
    expect(normalizeCover('')).toStrictEqual('');
  });
});

describe('Given a string', () => {
  it('should return an expected capitalized string', () => {
    expect(capitalize('john')).toStrictEqual('John');
    expect(capitalize('')).toStrictEqual('');
  });
});

describe('Given a string', () => {
  it('should return an expected string with capitalized initials', () => {
    expect(capitalizeInitials('john ronald reuel tolkien')).toStrictEqual('John Ronald Reuel Tolkien');
    expect(capitalizeInitials('j. r. r. tolkien')).toStrictEqual('J. R. R. Tolkien'); // TODO: remove spaces between initials?
    expect(capitalizeInitials('')).toStrictEqual('');
  });
});

// CALCULATION

describe('Given a number of milliseconds', () => {
  it('should return an expected duration', () => {
    expect(msToDuration(3600000)).toStrictEqual({ days: 0, hours: 1, minutes: 0, months: 0, seconds: 0, years: 0 });
    expect(msToDuration(0)).toStrictEqual({ days: 0, hours: 0, minutes: 0, months: 0, seconds: 0, years: 0 });
  });
});

describe('Given a date number', () => {
  it('should return an expected distance string', () => {
    const now: number = new Date(2022, 7, 26, 20).getTime();

    expect(timeSince(new Date(2017, 3, 15, 14).getTime(), now)).toStrictEqual('5 anni fa');
    expect(timeSince(new Date(2022, 6, 15, 14).getTime(), now)).toStrictEqual('un mese fa');
    expect(timeSince(new Date(2022, 7, 23, 14).getTime(), now)).toStrictEqual('3 giorni fa');
    expect(timeSince(new Date(2022, 7, 25, 14).getTime(), now)).toStrictEqual('un giorno fa');
    expect(timeSince(new Date(2022, 7, 26, 19, 30).getTime(), now)).toStrictEqual('30 minuti fa');
    expect(timeSince(new Date(2022, 7, 26, 19, 59, 55, 13).getTime(), now)).toStrictEqual('5 secondi fa');
  });
});

describe('Given a date number', () => {
  it('should return an expected age number', () => {
    const now: number = new Date(2022, 7, 26, 20).getTime();

    expect(calcAge(new Date(2017, 1).getTime(), now)).toStrictEqual(5);
    expect(calcAge(new Date(1984, 1).getTime(), now)).toStrictEqual(38);
  });
});

describe('Given a number', () => {
  it('should return an expected rounded number', () => {
    expect(round(1.98)).toStrictEqual(2);
    expect(round(1.48)).toStrictEqual(1.5);
    expect(round(1.01)).toStrictEqual(1);
    expect(round(0.01)).toStrictEqual(0);
    expect(round(NaN)).toStrictEqual(NaN);
  });
});

describe('Given a number of hours and 2 date numbers', () => {
  it('should return an expected number', () => {
    const now: number = new Date(2022, 7, 26, 1).getTime();

    expect(diffDates(24, new Date(2022, 7, 25, 23).getTime(), now)).toStrictEqual(0); // 0 days
    expect(diffDates(24, new Date(2022, 7, 25, 1).getTime(), now)).toStrictEqual(1); // 1 day
    expect(diffDates(1, new Date(2022, 7, 25, 1).getTime(), now)).toStrictEqual(24); // 24 hours
  });
});

describe('Given a number', () => {
  it('should return an expected abbreviated number', () => {
    expect(abbrNum(1_000_000_000_000)).toStrictEqual('1t');
    expect(abbrNum(1_000_000_000)).toStrictEqual('1b');
    expect(abbrNum(1_000_000)).toStrictEqual('1m');
    expect(abbrNum(1_000)).toStrictEqual('1k');
    expect(abbrNum(512)).toStrictEqual('512');
    expect(abbrNum(4.7333, 1)).toStrictEqual('4.7333'); // CHECK: is this correct?
  });
});