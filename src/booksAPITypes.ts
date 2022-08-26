// https://developers.google.com/books/docs/v1/using

export interface SearchParamsModel {
  q: string;
  intitle?: string;
  inauthor?: string;
  inpublisher?: string;
  isbn?: string;
  maxResults?: number;
  startIndex?: number;
}

export interface IndustryIdentifier {
  identifier: string;
  type: string;
}

export interface Dimensions {
  height: string;
  thickness: string;
  width: string;
}

export interface ImageLinks {
  extraLarge: string;
  large: string;
  medium: string;
  small: string;
  smallThumbnail: string;
  thumbnail: string;
}

export interface VolumeInfo {
  authors: string[];
  averageRating: number;
  canonicalVolumeLink: string;
  categories: string[];
  contentVersion: string;
  description: string;
  dimensions: Dimensions;
  imageLinks: ImageLinks;
  industryIdentifiers: IndustryIdentifier[];
  infoLink: string;
  isEbook?: boolean;
  language: string;
  mainCategory: string;
  pageCount: number;
  printType: string;
  publishedDate: string;
  publisher: string;
  ratingsCount: number;
  subtitle?: string;
  title: string;
}

export interface ListPrice {
  amount: number;
  currencyCode: string;
}

export interface RetailPrice {
  amount: number;
  currencyCode: string;
}

export interface SaleInfo {
  buyLink: string;
  country: string;
  isEbook: boolean;
  listPrice: ListPrice;
  retailPrice: RetailPrice;
  saleability: string;
}

export interface Epub {
  acsTokenLink: string;
  isAvailable: boolean;
}

export interface Pdf {
  isAvailable: boolean;
}

export interface AccessInfo {
  accessViewStatus: string;
  country: string;
  embeddable: boolean;
  epub: Epub;
  pdf: Pdf;
  publicDomain: boolean;
  textToSpeechPermission: string;
  viewability: string;
}

export interface VolumeModel {
  accessInfo: AccessInfo;
  etag: string;
  id: string;
  kind: string;
  saleInfo: SaleInfo;
  selfLink: string;
  volumeInfo: VolumeInfo;
}