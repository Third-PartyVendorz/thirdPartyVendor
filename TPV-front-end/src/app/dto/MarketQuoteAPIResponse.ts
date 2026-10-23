export interface MarketQuoteAPIResponse {
  data: MarketQuoteData;
}

export interface MarketQuoteBatchAPIResponse {
  data: {
    quotes: { symbol: string; stale?: boolean; quote: MarketQuoteData | null }[];
  };
}

export interface MarketQuoteData {
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  spreadBps: number;
  currency: string;
  change: number;
  changePercent: number;
  previousClose: number;
  asOf: string;
  marketState: string;
}