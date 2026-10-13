export interface OrderResponse {
    orderId: string;
    ticker: string;
    orderIntent: string;
    quantity: number | null;
    orderPrice: number | null;
    executionPrice: number | null;
    executionQuantity: number | null;
    status: string;
    createdAt: string;
    orderCurrency: string;
}