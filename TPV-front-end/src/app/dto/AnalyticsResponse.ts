export interface AnalyticsResponse {
  buy_count: number;
  buy_volume: number;
  sell_count: number;
  sell_volume: number;
  top_5_most_traded_assets: Record<string, string>;
  total_after_hours_volume: string;
  total_market_volume: number;
  trade_volume_by_date: Record<string, string>;
  trade_volume_by_date_and_side: Record<'BUY' | 'SELL', Record<string, string>>;
  volume_by_market_interval: Record<string, number | string>;
  volume_by_market_interval_and_side: Record<'BUY' | 'SELL', Record<string, string>>;
}