export interface MarketSymbolAPIResponse {
  data: MarketSymbolData;
}

export interface MarketSymbolData {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
  currency: string;
  active: boolean;
}