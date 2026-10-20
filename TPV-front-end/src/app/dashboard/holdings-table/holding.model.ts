export interface Holding {
    ticker: string;
    numShares: number;
    userId: number;
    security: string;
    assetType: string;
    // Market data (fetched from MarketApiService)
    lastPrice?: number;
    name?: string;
    type?: string;
    price?: number;
    change?: number;
    changePercent?: number;
    previousClose?: number;
    // Calculated fields
    marketValue?: number;
    gainLoss?: number;
    gainLossPercent?: number;
    dailyChangePercent?: number;
    companyName?: string;
}