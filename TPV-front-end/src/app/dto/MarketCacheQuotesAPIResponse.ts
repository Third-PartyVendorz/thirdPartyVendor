import { MarketQuoteData } from "./MarketQuoteAPIResponse";

export interface MarketCacheQuotesAPIResponse {
    data: Quotes;
}

export interface Quotes {
    quotes: Quote[];
}

export interface Quote {
    symbol: string;
    quote: MarketQuoteData;
}