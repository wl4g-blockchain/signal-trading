import React, { useState } from 'react';
import { Report, TradeRecord } from '../../types';
import { FileText, Download, Calendar, TrendingUp, Target, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';

export const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  // Mock data
  const mockReports: Report[] = [
    {
      id: 'report-1',
      workflowId: 'workflow-1',
      period: { start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), end: new Date() },
      totalTrades: 156,
      successfulTrades: 142,
      totalProfit: 3247.89,
      totalVolume: 125000,
      averageArbitrageRate: 2.6,
      maxDrawdown: -150.32,
      sharpeRatio: 1.85,
      trades: [],
    }
  ];

  const performanceData = [
    { name: 'Mon', profit: 245, volume: 15000 },
    { name: 'Tue', profit: 389, volume: 22000 },
    { name: 'Wed', profit: -89, volume: 8000 },
    { name: 'Thu', profit: 567, volume: 35000 },
    { name: 'Fri', profit: 234, volume: 18000 },
    { name: 'Sat', profit: 445, volume: 28000 },
    { name: 'Sun', profit: 123, volume: 12000 },
  ];

  const strategyData = [
    { name: 'Arbitrage', value: 60, color: '#3B82F6' },
    { name: 'Momentum', value: 25, color: '#10B981' },
    { name: 'Mean Reversion', value: 15, color: '#F59E0B' },
  ];

  const currentReport = mockReports[0];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Trading Reports</h2>
        <div className="flex items-center space-x-4">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 3 Months</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Profit</p>
              <p className="text-2xl font-bold text-green-400">
                ${currentReport.totalProfit.toFixed(2)}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                +{((currentReport.totalProfit / currentReport.totalVolume) * 100).toFixed(2)}% ROI
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Success Rate</p>
              <p className="text-2xl font-bold text-blue-400">
                {((currentReport.successfulTrades / currentReport.totalTrades) * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {currentReport.successfulTrades}/{currentReport.totalTrades} trades
              </p>
            </div>
            <Target className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Arbitrage Rate</p>
              <p className="text-2xl font-bold text-purple-400">
                {currentReport.averageArbitrageRate.toFixed(2)}%
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Per successful trade
              </p>
            </div>
            <Award className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Sharpe Ratio</p>
              <p className="text-2xl font-bold text-orange-400">
                {currentReport.sharpeRatio.toFixed(2)}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Risk-adjusted return
              </p>
            </div>
            <FileText className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Daily Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                />
                <Bar dataKey="profit" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Strategy Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={strategyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {strategyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {strategyData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-300">{item.name}</span>
                </div>
                <span className="text-sm text-gray-400">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Performance Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">${currentReport.totalVolume.toLocaleString()}</p>
            <p className="text-sm text-gray-400">Total Volume</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">${Math.abs(currentReport.maxDrawdown).toFixed(2)}</p>
            <p className="text-sm text-gray-400">Max Drawdown</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">{currentReport.totalTrades}</p>
            <p className="text-sm text-gray-400">Total Trades</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">
              ${(currentReport.totalProfit / currentReport.totalTrades).toFixed(2)}
            </p>
            <p className="text-sm text-gray-400">Avg Profit/Trade</p>
          </div>
        </div>
      </div>
    </div>
  );
};