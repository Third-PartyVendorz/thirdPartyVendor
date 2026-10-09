export interface OrderRequest {
    symbol: string;
    side: string;
    quantity: number;
    price: number;
    currency: string;
}