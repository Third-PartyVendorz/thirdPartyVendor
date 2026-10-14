import { OrderStatus } from "../shared/order-status";
import { TradeSide } from "../shared/trade-side";

export interface OrderResponse {
    orderId: number;
    ticker: string;
    orderIntent: TradeSide;
    quantity: number | null;
    orderPrice: number | null;
    executionPrice: number | null;
    executionQuantity: number | null;
    status: OrderStatus;
    createdAt: string;
    orderCurrency: string;
}