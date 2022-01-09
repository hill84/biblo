import { GroupModel, NoteModel, UserModel } from '../types';

export const user: UserModel = {
  creationTime: 123456789,
  uid: 'abc',
  displayName: 'Mario Rossi',
  email: 'giu.gerbino@gmail.com',
  birth_date: 123456789,
  continent: 'Europa',
  country: 'Italia',
  city: 'Torino',
  languages: ['Italiano', 'Giapponese'],
  photoURL: '',
  sex: 'm',
  roles: {
    admin: true,
    premium: true,
    editor: true
  },
  stats: {
    ratings_num: 13,
    reviews_num: 4,
    shelf_num: 3,
    wishlist_num: 7
  }
};

export const notes: NoteModel[] = [
  { nid: '1', text: 'Benvenuto su Biblo', created_num: 1534239242276, read: false },
  { nid: '2', text: '<a href="/user/Mario">Mario</a> ti ha inviato un messaggio', created_num: 1534188592106, read: true },
  { nid: '3', text: 'Completa il tuo profilo', created_num: 1534158592106, read: false },
  { nid: '4', text: 'Sara ha iniziato a seguirti', created_num: 1534147592106, read: false }
];

export const groups: GroupModel[] = [{
  gid: '1',
  title: 'Group title #1',
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam vulputate cursus ipsum ac imperdiet. Mauris sit amet nisl imperdiet, semper est vel, condimentum augue. Sed augue tellus, gravida eget consectetur id, blandit eu felis. Maecenas eget arcu nec diam ultricies facilisis. Aliquam sit amet lorem enim. Duis sollicitudin iaculis urna, sit amet mattis eros gravida fringilla. Vestibulum interdum sagittis ullamcorper. Nam auctor ac nulla sit amet semper. Morbi at arcu nec urna imperdiet tempor. Quisque volutpat volutpat felis, a convallis justo iaculis at. Pellentesque tristique ante sem, ut iaculis arcu consectetur et.',
  edit: true,
  rules: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam vulputate cursus ipsum ac imperdiet. Mauris sit amet nisl imperdiet, semper est vel, condimentum augue. Sed augue tellus, gravida eget consectetur id, blandit eu felis. Maecenas eget arcu nec diam ultricies facilisis.',
  photoURL: '',
  followers_num: 12,
  type: 'public',
  location: 'Milano',
  created_num: 0,
  owner: 'Mario Rossi',
  ownerUid: 'abcdef',
  lastEditByUid: '',
  lastEditBy: '',
  lastEdit_num: 0,
  moderators: [
    'abcdef',
    'ghilmn',
    // { uid: 'abcdef', displayName: 'Mario Rossi', photoURL: '', timestamp: 0 }, 
    // { uid: 'ghilmn', displayName: 'Valeria Verdi', photoURL: '', timestamp: 0 },
  ]
}, {
  gid: '2',
  title: 'Group title #2',
  description: 'Consectetur adipiscing elit. Aliquam vulputate cursus ipsum ac imperdiet. Mauris sit amet nisl imperdiet, semper est vel, condimentum augue. Sed augue tellus, gravida eget consectetur id, blandit eu felis. Maecenas eget arcu nec diam ultricies facilisis. Aliquam sit amet lorem enim. Duis sollicitudin iaculis urna, sit amet mattis eros gravida fringilla. Vestibulum interdum sagittis ullamcorper. Nam auctor ac nulla sit amet semper. Morbi at arcu nec urna imperdiet tempor. Quisque volutpat volutpat felis, a convallis justo iaculis at. Pellentesque tristique ante sem, ut iaculis arcu consectetur et.',
  edit: true,
  rules: '',
  photoURL: '',
  followers_num: 3,
  type: 'public',
  location: '',
  created_num: 0,
  owner: 'Mario Rossi',
  ownerUid: 'abcdef',
  lastEditByUid: '',
  lastEditBy: '',
  lastEdit_num: 0,
  moderators: [
    'abcdef',
    // { uid: 'abcdef', displayName: 'Mario Rossi', photoURL: '', timestamp: 0 },
  ]
}, {
  gid: '3',
  title: 'Group title #3',
  description: 'Aliquam vulputate cursus ipsum ac imperdiet vulputate cursus.',
  edit: true,
  rules: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam vulputate cursus ipsum ac imperdiet.',
  photoURL: '',
  followers_num: 253,
  type: 'public',
  location: '',
  created_num: 0,
  owner: 'Mario Rossi',
  ownerUid: 'abcdef',
  lastEditByUid: '',
  lastEditBy: '',
  lastEdit_num: 0,
  moderators: [
    'abcdef',
    'ghilmn',
    'opqrst',
    // { uid: 'abcdef', displayName: 'Mario Rossi', photoURL: '', timestamp: 0 },
    // { uid: 'ghilmn', displayName: 'Valeria Verdi', photoURL: '', timestamp: 0 }
    // { uid: 'opqrst', displayName: 'Sandra Gialli', photoURL: '', timestamp: 0 },
  ]
}];