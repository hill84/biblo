interface EmojiMartLocaleModel {
  search: string;
  clear: string;
  notfound: string;
  skintext: string;
  categories: Record<string, string>;
  categorieslabel: string;
  skintones: Record<number, string>;
}

const emojiMartLocale: EmojiMartLocaleModel = {
  search: 'Cerca',
  clear: 'Clear', // Accessible label on "clear" button
  notfound: 'Nessuna emoji trovata',
  skintext: 'Scegli il tono della pelle di default',
  categories: {
    search: 'Cerca risultati',
    recent: 'Usate di frequente',
    people: 'Emoticon e persone',
    nature: 'Animali e natura',
    foods: 'Cibo e bevande',
    activity: 'Attività',
    places: 'Viaggi e luoghi',
    objects: 'Oggetti',
    symbols: 'Simboli',
    flags: 'Bandiere',
    custom: 'Custom',
  },
  categorieslabel: 'Categorie emoji', // Accessible title for the list of categories
  skintones: {
    1: 'Tono della pelle di default',
    2: 'Tono chiaro',
    3: 'Tono medio-chiaro',
    4: 'Tono medio',
    5: 'Tono medio-scuro',
    6: 'Tono scuro',
  },
};

export default emojiMartLocale;