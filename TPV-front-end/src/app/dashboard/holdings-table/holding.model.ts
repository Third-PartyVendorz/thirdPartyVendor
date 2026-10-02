export interface Holding {
    ticker: string;
    companyName: string;
    shares: number;
    averageCost: number;
    lastPrice: number;
    marketValue: number;
    gainLoss: number;
    gainLossPercent: number;
    dailyChangePercent: number;
}