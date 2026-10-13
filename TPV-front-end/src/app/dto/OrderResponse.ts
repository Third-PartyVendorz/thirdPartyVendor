export interface OrderResponse {
    orderId: string;
    ticker: string;
    orderIntent: string;
    quantity: number;
    orderPrice: number;
    executionPrice: number;
    executionQuantity: number;
    status: string;
    createdAt: string;
    orderCurrency: string;
}