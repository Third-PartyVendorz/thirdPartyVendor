import { Holding } from './holding.model';

export const MOCK_HOLDINGS: Holding[] = [
  {
    companyName: 'Apple Inc.',
    shares: 100,
    averageCost: 145.50,
    lastPrice: 178.72,
    marketValue: 17872.00,
    gainLoss: 3322.00,
    gainLossPercent: 22.83,
    dailyChangePercent: 1.45
  },
  {
    companyName: 'Microsoft Corporation',
    shares: 50,
    averageCost: 280.25,
    lastPrice: 380.46,
    marketValue: 19023.00,
    gainLoss: 5012.50,
    gainLossPercent: 35.64,
    dailyChangePercent: 0.89
  },
  {
    companyName: 'Amazon.com Inc.',
    shares: 30,
    averageCost: 150.00,
    lastPrice: 193.15,
    marketValue: 5794.50,
    gainLoss: 1294.50,
    gainLossPercent: 28.77,
    dailyChangePercent: 2.12
  },
  {
    companyName: 'Alphabet Inc.',
    shares: 25,
    averageCost: 120.75,
    lastPrice: 142.58,
    marketValue: 3564.50,
    gainLoss: 545.75,
    gainLossPercent: 18.05,
    dailyChangePercent: -0.32
  },
  {
    companyName: 'Tesla Inc.',
    shares: 20,
    averageCost: 250.00,
    lastPrice: 238.45,
    marketValue: 4769.00,
    gainLoss: -229.00,
    gainLossPercent: -4.60,
    dailyChangePercent: -2.14
  },
  {
    companyName: 'Meta Platforms Inc.',
    shares: 40,
    averageCost: 110.30,
    lastPrice: 138.92,
    marketValue: 5556.80,
    gainLoss: 1144.80,
    gainLossPercent: 25.99,
    dailyChangePercent: 3.21
  },
  {
    companyName: 'NVIDIA Corporation',
    shares: 15,
    averageCost: 85.20,
    lastPrice: 142.35,
    marketValue: 2135.25,
    gainLoss: 852.75,
    gainLossPercent: 66.92,
    dailyChangePercent: 1.78
  },
  {
    companyName: 'Berkshire Hathaway Inc.',
    shares: 5,
    averageCost: 380.50,
    lastPrice: 425.67,
    marketValue: 2128.35,
    gainLoss: 225.85,
    gainLossPercent: 11.88,
    dailyChangePercent: 0.45
  }
];
