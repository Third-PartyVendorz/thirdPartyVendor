export interface CashTransactionResponse {
  transactionId: number;
  currencyCode: string;
  type: 'DEPOSIT' | 'WITHDRAW';
  amount: number;
  createdAt: string;
}
