export interface CashTransactionRequest {
  currencyCode: string;
  type: 'DEPOSIT' | 'WITHDRAW';
  amount: number;
}