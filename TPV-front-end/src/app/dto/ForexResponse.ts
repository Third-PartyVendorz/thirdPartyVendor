export interface ForexResponse {
  exchangeId: number;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  exchangeRate: number;
  exchangeTimestamp: string;
}