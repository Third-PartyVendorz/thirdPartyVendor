export interface Holding {
    ticker: string;
    numShares: number;
    userId: number;
    security: string;
    assetType: string;
    // Market data (fetched from MarketApiService)
    lastPrice?: number;
    companyName?: string;
    type?: string;
    price?: number;
    change?: number;
    changePercent?: number;
    // Calculated fields
    marketValue?: number;
    gainLoss?: number;
    gainLossPercent?: number;
    dailyChangePercent?: number;
}