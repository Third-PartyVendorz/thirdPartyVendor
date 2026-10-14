export interface MarketHistoricalAPIResponse {
  data: MarketHistoricalData;
}

export interface MarketHistoricalData {
  symbol: string;
  interval: string;
  currency: string;
  candles: MarketHistoricalCandle[];
}

export interface MarketHistoricalCandle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  adjclose: number;
  volume: number;
  synthetic: boolean;
}