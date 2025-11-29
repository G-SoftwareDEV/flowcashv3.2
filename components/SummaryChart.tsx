import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction, TimeRange } from '../types';
import { formatCurrency } from '../services/utils';

interface SummaryChartProps {
  transactions: Transaction[];
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  isHistoricalView: boolean;
}

const COLORS = ['#22c55e', '#ef4444']; // Green-500, Red-500

const SummaryChart: React.FC<SummaryChartProps> = ({ transactions, timeRange, onTimeRangeChange, isHistoricalView }) => {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const total = totalIncome - totalExpense;
  const isNegative = total < 0;

  const data = [
    { name: 'Ganhos', value: totalIncome },
    { name: 'Gastos', value: totalExpense },
  ];

  // If no data, show empty circle state logic could be added here, but recharts handles empty gracefully usually
  const hasData = totalIncome > 0 || totalExpense > 0;

  return (
    <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex flex-col items-center h-full min-h-[400px]">
      
      {!isHistoricalView && (
        <div className="w-full flex justify-center mb-6">
          <div className="bg-gray-100 p-1 rounded-xl flex text-sm font-medium">
            {(['today', '7days', '30days', '1year'] as TimeRange[]).map((range) => {
              const labels: Record<string, string> = {
                today: 'Hoje',
                '7days': '7 Dias',
                '30days': '30 Dias',
                '1year': 'Ano'
              };
              return (
                <button
                  key={range}
                  onClick={() => onTimeRangeChange(range)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    timeRange === range
                      ? 'bg-white text-orange-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {labels[range]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {isHistoricalView && <h3 className="text-gray-500 font-medium mb-4">Visualização Histórica</h3>}

      <div className="flex-1 w-full relative">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                 formatter={(value: number) => formatCurrency(value)}
                 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300">
            <div className="text-center">
              <div className="w-32 h-32 rounded-full border-4 border-gray-100 mx-auto mb-2"></div>
              <p>Sem dados para exibir</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 text-center w-full border-t border-gray-100 pt-6">
        <p className="text-gray-400 text-sm font-medium uppercase tracking-wide mb-1">Saldo Total</p>
        <p className={`text-3xl font-extrabold ${isNegative ? 'text-red-500' : 'text-blue-500'}`}>
          {formatCurrency(total)}
        </p>
      </div>
    </div>
  );
};

export default SummaryChart;