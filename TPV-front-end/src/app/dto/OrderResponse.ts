export interface OrderResponse {
    orderId: string;
    symbol: string;
    side: string;
    quantity: number;
    price: number;
    status: string;
    timestamp: string;
    currency: string;
}