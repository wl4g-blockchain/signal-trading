import React, { useState, useEffect } from "react";
import { TradeRecord } from "../../types";
import { Activity, TrendingUp, DollarSign, Zap, Wallet, ExternalLink, Eye } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { useTheme } from "../../contexts/ThemeContext";
import { useTranslation } from "react-i18next";

interface LiveDashboardProps {
  showReports?: boolean;
  onNavigateToWorkflowRun?: (workflowId: string, tradeId: string) => void;
}

export const LiveDashboard: React.FC<LiveDashboardProps> = ({
  showReports,
  onNavigateToWorkflowRun,
}) => {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  
  const stats = {
    totalProfit: 12450.32,
    todayProfit: 892.15,
    successRate: 87.5,
    activeTrades: 3,
  };

  // Mock balance data
  const dexBalances = [
    { chain: 'ethereum', symbol: 'ETH', balance: '2.5734', usdValue: 9006.90, vaultAddress: '0x742d...5b1' },
    { chain: 'ethereum', symbol: 'USDC', balance: '5420.30', usdValue: 5420.30, vaultAddress: '0x742d...5b1' },
    { chain: 'polygon', symbol: 'MATIC', balance: '8450.12', usdValue: 6760.10, vaultAddress: '0x981c...2a7' },
    { chain: 'bsc', symbol: 'BNB', balance: '12.87', usdValue: 7722.00, vaultAddress: '0x523a...9f2' },
  ];

  const cexBalances = [
    { exchange: 'binance', symbol: 'BTC', balance: '0.1234', usdValue: 5432.10 },
    { exchange: 'binance', symbol: 'ETH', balance: '3.8976', usdValue: 13641.60 },
    { exchange: 'okx', symbol: 'USDT', balance: '2100.50', usdValue: 2100.50 },
    { exchange: 'coinbase', symbol: 'SOL', balance: '45.67', usdValue: 10280.15 },
  ];

  // Mock real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      // Use existing workflow run IDs from mock service
      const workflowRunIds = ["run-1", "run-2"]; // These match the mock data in mock_service.ts
      const randomRunId = workflowRunIds[Math.floor(Math.random() * workflowRunIds.length)];
      
      const newTrade: TradeRecord = {
        id: `trade-${Date.now()}`,
        workflowId: "workflow-1", // This should match the workflow that contains the run
        workflowRunId: randomRunId, // Add this field to link to specific run
        timestamp: new Date(),
        strategy: "Arbitrage ETH/USDC",
        pair: "ETH/USDC",
        amount: Math.random() * 1000 + 100,
        entryPrice: 2450 + Math.random() * 100,
        slippage: Math.random() * 2,
        profit: (Math.random() - 0.3) * 50,
        status: Math.random() > 0.1 ? "success" : "failed",
        txHash: `0x${Math.random().toString(16).substr(2, 8)}...`,
      };

      setTrades((prev) => [newTrade, ...prev.slice(0, 49)]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const chartData = trades
    .slice(0, 20)
    .reverse()
    .map((trade, index) => ({
      time: index,
      profit: trade.profit,
      cumulative: trades
        .slice(0, index + 1)
        .reduce((sum, t) => sum + t.profit, 0),
    }));

  const getChainIcon = (chain: string) => {
    switch(chain) {
      case 'ethereum': return '⟠';
      case 'polygon': return '⬟';
      case 'bsc': return '🟡';
      default: return '🔗';
    }
  };

  const getExchangeIcon = (exchange: string) => {
    switch(exchange) {
      case 'binance': return '🟨';
      case 'okx': return '⚫';
      case 'coinbase': return '🔵';
      default: return '🏢';
    }
  };

  const handleTradeClick = (trade: TradeRecord) => {
    console.log('🔍 Trade clicked:', trade);
    
    if (onNavigateToWorkflowRun && trade.workflowRunId) {
      console.log('🚀 Navigating to workflow run:', { workflowId: trade.workflowId, runId: trade.workflowRunId });
      // Pass the workflow run ID instead of trade ID
      onNavigateToWorkflowRun(trade.workflowId, trade.workflowRunId);
    } else {
      console.warn('⚠️ Cannot navigate to workflow run: missing workflowRunId', trade);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('dashboard.title')}</h2>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 font-medium">Live</span>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'} rounded-lg p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>{t('dashboard.totalProfit')}</p>
              <p className="text-xl font-bold text-green-400">
                ${stats.totalProfit.toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-6 h-6 text-green-400" />
          </div>
        </div>

        <div className={`${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'} rounded-lg p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>{t('dashboard.todayProfit')}</p>
              <p className="text-xl font-bold text-blue-400">
                ${stats.todayProfit.toFixed(2)}
              </p>
            </div>
            <TrendingUp className="w-6 h-6 text-blue-400" />
          </div>
        </div>

        <div className={`${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'} rounded-lg p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>{t('dashboard.successRate')}</p>
              <p className="text-xl font-bold text-purple-400">
                {stats.successRate}%
              </p>
            </div>
            <Activity className="w-6 h-6 text-purple-400" />
          </div>
        </div>

        <div className={`${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'} rounded-lg p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>{t('dashboard.activeTrades')}</p>
              <p className="text-xl font-bold text-orange-400">
                {stats.activeTrades}
              </p>
            </div>
            <Zap className="w-6 h-6 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Balance Section - Compact */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* DEX Balances - Consistent with other sections */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'} rounded-lg p-4`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Wallet className="w-5 h-5 text-blue-400" />
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('dashboard.balance.dexBalance')}</h3>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">{t('common.total')}</div>
              <div className="text-xl font-bold text-blue-400">
                ${dexBalances.reduce((sum, b) => sum + b.usdValue, 0).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {dexBalances.map((balance, idx) => (
              <div key={idx} className={`flex items-center justify-between p-2 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded text-xs`}>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{getChainIcon(balance.chain)}</span>
                  <div>
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {balance.balance} {balance.symbol}
                    </div>
                    <div className="text-xs text-gray-400 capitalize">
                      {t(`dashboard.balance.${balance.chain}`)}
                    </div>
                  </div>
                </div>
                <div className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ${balance.usdValue.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CEX Balances - Consistent with other sections */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'} rounded-lg p-4`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-purple-400" />
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('dashboard.balance.cexBalance')}</h3>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">{t('common.total')}</div>
              <div className="text-xl font-bold text-purple-400">
                ${cexBalances.reduce((sum, b) => sum + b.usdValue, 0).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {cexBalances.map((balance, idx) => (
              <div key={idx} className={`flex items-center justify-between p-2 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded text-xs`}>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{getExchangeIcon(balance.exchange)}</span>
                  <div>
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {balance.balance} {balance.symbol}
                    </div>
                    <div className="text-xs text-gray-400 capitalize">
                      {t(`dashboard.balance.${balance.exchange}`)}
                    </div>
                  </div>
                </div>
                <div className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ${balance.usdValue.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'} rounded-lg p-4`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 flex items-center space-x-2`}>
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <span>{t('dashboard.profitTimeline')}</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#F3F4F6",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'} rounded-lg p-4`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
            {t('dashboard.tradePerformance')}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#F3F4F6",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Trades */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'} rounded-lg p-4`}>
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>{t('dashboard.recentTrades')}</h3>
        <div className="overflow-x-auto max-h-64 overflow-y-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-3 text-gray-400 text-sm">{t('dashboard.time')}</th>
                <th className="text-left py-2 px-3 text-gray-400 text-sm">{t('dashboard.strategy')}</th>
                <th className="text-left py-2 px-3 text-gray-400 text-sm">{t('dashboard.pair')}</th>
                <th className="text-left py-2 px-3 text-gray-400 text-sm">{t('dashboard.amount')}</th>
                <th className="text-left py-2 px-3 text-gray-400 text-sm">{t('dashboard.profit')}</th>
                <th className="text-left py-2 px-3 text-gray-400 text-sm">{t('dashboard.status')}</th>
                <th className="text-left py-2 px-3 text-gray-400 text-sm">{t('dashboard.action')}</th>
              </tr>
            </thead>
            <tbody>
              {trades.slice(0, 10).map((trade) => (
                <tr
                  key={trade.id}
                  className={`border-b border-gray-700 hover:${isDark ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}
                >
                  <td className="py-2 px-3 text-gray-300 text-sm">
                    {trade.timestamp.toLocaleTimeString()}
                  </td>
                  <td className="py-2 px-3 text-gray-300 text-sm">{trade.strategy}</td>
                  <td className="py-2 px-3 text-gray-300 text-sm">{trade.pair}</td>
                  <td className="py-2 px-3 text-gray-300 text-sm">
                    ${trade.amount.toFixed(2)}
                  </td>
                  <td
                    className={`py-2 px-3 font-medium text-sm ${
                      trade.profit >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    ${trade.profit.toFixed(2)}
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        trade.status === "success"
                          ? "bg-green-600 text-green-200"
                          : "bg-red-600 text-red-200"
                      }`}
                    >
                      {trade.status}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <button
                      onClick={() => handleTradeClick(trade)}
                      className={`inline-flex items-center space-x-1 px-2 py-1 text-xs rounded-md transition-colors ${
                        isDark 
                          ? 'bg-blue-600 hover:bg-blue-700 text-blue-100' 
                          : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                      }`}
                      title={t('dashboard.viewWorkflowRun')}
                    >
                      <Eye className="w-3 h-3" />
                      <span>{t('dashboard.viewDetails')}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* 合并 Reports 内容 */}
      {showReports && <div className="mt-8"></div>}
    </div>
  );
};
