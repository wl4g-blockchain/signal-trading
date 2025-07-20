# Signal Trading Platform

A comprehensive AI-powered trading platform that combines social media sentiment analysis, market data monitoring, and automated trading execution.

## Recent Updates - Unified Feed Components

### Overview
We have unified the Twitter and Binance data source components to provide a more streamlined user experience with flexible data collection modes.

### New Components

#### Twitter Feed
- **Type**: `TWITTER_FEED`
- **Description**: Unified component for Twitter data extraction and streaming
- **Features**:
  - **Polling Mode**: Traditional API-based data collection with configurable intervals
  - **WebSocket Mode**: Real-time data streaming with caching mechanism
  - **Configurable Parameters**:
    - API Key
    - Accounts (comma-separated)
    - Keywords (comma-separated)
    - Polling Interval (1-60 minutes)
    - Cache Retention (5-1440 minutes for WebSocket mode)

#### Binance Feed
- **Type**: `BINANCE_FEED`
- **Description**: Unified component for Binance market data extraction and streaming
- **Features**:
  - **Polling Mode**: Traditional API-based data collection with configurable intervals
  - **WebSocket Mode**: Real-time data streaming with caching mechanism
  - **Configurable Parameters**:
    - API Key & Secret
    - Trading Symbols (comma-separated)
    - Timeframe (1h, 4h, 6h, 12h, 24h, 72h)
    - Polling Interval (1-60 minutes)
    - Cache Retention (5-1440 minutes for WebSocket mode)

#### Uniswap Feed
- **Type**: `UNISWAP_FEED`
- **Description**: Unified component for Uniswap liquidity and swap data extraction
- **Features**:
  - **Polling Mode**: API-based data collection with configurable intervals
  - **Configurable Parameters**:
    - RPC Endpoint
    - Pool Address
    - Polling Interval (1-60 minutes)

#### CoinMarket Feed
- **Type**: `COINMARKET_FEED`
- **Description**: Unified component for CoinMarketCap cryptocurrency market data extraction
- **Features**:
  - **Polling Mode**: API-based data collection with configurable intervals
  - **Configurable Parameters**:
    - API Key
    - Trading Symbols (comma-separated)
    - Polling Interval (1-60 minutes)

### WebSocket Integration

When WebSocket mode is enabled:
1. **Data Collection**: Real-time data is collected via WebSocket connections
2. **Caching**: Data is cached in memory until the next workflow execution cycle
3. **Output**: Cached data is provided to downstream nodes during execution
4. **Retention**: Configurable cache retention period (default: 30 minutes)

### Backward Compatibility

The platform maintains backward compatibility with existing workflows:
- Legacy `TWITTER_EXTRACTOR` and `TWITTER_STREAM` components are automatically mapped to `TWITTER_FEED`
- Legacy `BINANCE_EXTRACTOR` and `BINANCE_STREAM` components are automatically mapped to `BINANCE_FEED`
- Legacy `UNISWAP_EXTRACTOR` components are automatically mapped to `UNISWAP_FEED`
- Legacy `COINMARKET_EXTRACTOR` components are automatically mapped to `COINMARKET_FEED`
- Existing configurations are preserved and enhanced with new options

### Internationalization

All new components support full internationalization:
- **English**: Default language with technical terminology
- **Chinese**: Localized interface with appropriate terminology
- **Dynamic Language Switching**: Real-time language updates without page refresh

### Technical Implementation

#### Frontend Changes
- Updated component registry with unified schemas
- Enhanced configuration modals with WebSocket options
- Improved node display with mode indicators (Poll/Stream)
- Added comprehensive validation for new parameters

#### Backend Changes
- Enhanced API endpoints to handle WebSocket mode
- Implemented caching mechanism for real-time data
- Added support for configurable retention periods
- Maintained backward compatibility with legacy components

#### Database Updates
- Updated migration files to use new component types
- Preserved existing workflow data with automatic mapping

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- Redis (for WebSocket caching)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/signal-trading.git
cd signal-trading
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run database migrations:
```bash
npm run db:migrate
```

5. Start the development server:
```bash
npm run dev
```

## Usage

### Creating a Workflow

1. **Add Data Sources**: Use the new unified feed components
   - Drag `Twitter Feed` or `Binance Feed` from the component palette
   - Configure data collection mode (Polling or WebSocket)
   - Set up API credentials and data parameters

2. **Configure WebSocket Mode** (Optional):
   - Enable WebSocket streaming for real-time data
   - Set cache retention period
   - Monitor data flow in real-time

3. **Connect Components**: Link data sources to AI evaluators and trading executors

4. **Run Workflow**: Execute the workflow to see the unified components in action

### Configuration Examples

#### Twitter Feed - Polling Mode
```json
{
  "apiKey": "your-twitter-api-key",
  "accounts": ["elonmusk", "VitalikButerin"],
  "keywords": ["ETH", "Bitcoin"],
  "enableWebSocket": false,
  "pollingInterval": 5
}
```

#### Binance Feed - WebSocket Mode
```json
{
  "apiKey": "your-binance-api-key",
  "apiSecret": "your-binance-api-secret",
  "symbols": ["BTCUSDT", "ETHUSDT"],
  "timeframe": "1h",
  "enableWebSocket": true,
  "cacheRetention": 30
}
```

## Architecture

### Component Structure
```
Data Sources (Unified Feed Components)
├── Twitter Feed
│   ├── Polling Mode (API-based)
│   └── WebSocket Mode (Real-time + Caching)
├── Binance Feed
│   ├── Polling Mode (API-based)
│   └── WebSocket Mode (Real-time + Caching)
├── Uniswap Feed
│   └── Polling Mode (API-based)
└── CoinMarket Feed
    └── Polling Mode (API-based)

AI Analysis
├── AI Evaluator (GPT-4, Claude, etc.)

Trading Execution
├── CEX Executors (Binance, OKX)
└── DEX Executors (EVM, Bitcoin, Solana)

Result Collection
└── Result Collectors (Monitor & Report)
```

### Data Flow
1. **Data Collection**: Unified feed components collect data via polling or WebSocket
2. **Caching**: WebSocket data is cached until next execution cycle
3. **Analysis**: AI evaluators process the collected data
4. **Execution**: Trading executors act on AI recommendations
5. **Monitoring**: Result collectors track performance and outcomes

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation for common solutions