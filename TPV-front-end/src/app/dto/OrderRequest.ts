import { TradeSide } from "../shared/trade-side";

export interface OrderRequest {
    ticker: string;
    orderIntent: TradeSide;
    quantity?: number;
    orderPrice?: number;
    orderCurrency: string;
}