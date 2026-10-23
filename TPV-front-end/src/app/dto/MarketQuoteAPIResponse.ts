export interface MarketQuoteAPIResponse {
  data: MarketQuoteData;
}

export interface MarketQuoteBatchAPIResponse {
  data: Record<string, MarketQuoteData | null>;
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