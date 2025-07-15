import React, { useState, useEffect } from "react";
import { TradeRecord } from "../../types";
import { Activity, TrendingUp, DollarSign, Zap } from "lucide-react";
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

interface LiveDashboardProps {
  showReports?: boolean;
}

export const LiveDashboard: React.FC<LiveDashboardProps> = ({
  showReports,
}) => {
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const stats = {
    totalProfit: 12450.32,
    todayProfit: 892.15,
    successRate: 87.5,
    activeTrades: 3,
  };

  // Mock real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      const newTrade: TradeRecord = {
        id: `trade-${Date.now()}`,
        workflowId: "workflow-1",
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Live Trading Monitor</h2>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 font-medium">Live</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Profit</p>
              <p className="text-2xl font-bold text-green-400">
                ${stats.totalProfit.toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Today's Profit</p>
              <p className="text-2xl font-bold text-blue-400">
                ${stats.todayProfit.toFixed(2)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Success Rate</p>
              <p className="text-2xl font-bold text-purple-400">
                {stats.successRate}%
              </p>
            </div>
            <Activity className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Trades</p>
              <p className="text-2xl font-bold text-orange-400">
                {stats.activeTrades}
              </p>
            </div>
            <Zap className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Profit Timeline
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

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Trade Performance
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
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Trades</h3>
        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400">Time</th>
                <th className="text-left py-3 px-4 text-gray-400">Strategy</th>
                <th className="text-left py-3 px-4 text-gray-400">Pair</th>
                <th className="text-left py-3 px-4 text-gray-400">Amount</th>
                <th className="text-left py-3 px-4 text-gray-400">Profit</th>
                <th className="text-left py-3 px-4 text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {trades.slice(0, 10).map((trade) => (
                <tr
                  key={trade.id}
                  className="border-b border-gray-700 hover:bg-gray-700"
                >
                  <td className="py-3 px-4 text-gray-300">
                    {trade.timestamp.toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-4 text-gray-300">{trade.strategy}</td>
                  <td className="py-3 px-4 text-gray-300">{trade.pair}</td>
                  <td className="py-3 px-4 text-gray-300">
                    ${trade.amount.toFixed(2)}
                  </td>
                  <td
                    className={`py-3 px-4 font-medium ${
                      trade.profit >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    ${trade.profit.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* 合并 Reports 内容 */}
      {showReports && <div className="mt-10"></div>}
    </div>
  );
};
