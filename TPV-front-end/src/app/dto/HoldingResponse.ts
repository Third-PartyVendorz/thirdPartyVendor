export interface HoldingResponse {
    userId: number;
    security: string;
    ticker: string;
    assetType: string;
    numShares: number;
    costBasis?: number;
    realizedGainLoss?: number;
}