export interface OrderResponse {
	orderId: number;
	userId: number;
	assetId: number;
	ticker: string;
	orderIntent: 'BUY' | 'SELL';
	quantity: number | null;
	orderPrice: number | null;
	status: 'PENDING' | 'EXECUTED' | 'CANCELLED';
	createdAt: string;
	orderCurrency: string;
}