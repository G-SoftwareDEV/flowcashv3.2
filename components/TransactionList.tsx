import React from 'react';
import { Trash2 } from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency, formatTime } from '../services/utils';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  readOnly: boolean;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete, readOnly }) => {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <p className="text-lg">Nenhuma atividade registrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2 pb-20">
      {transactions.map((transaction) => {
        const isIncome = transaction.type === 'income';
        return (
          <div
            key={transaction.id}
            className={`
              relative flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border-l-8 
              transition-all hover:shadow-md
              ${isIncome ? 'border-green-500' : 'border-red-500'}
            `}
          >
            <div className="flex flex-col">
              <span className="font-semibold text-gray-800 text-lg">{transaction.description}</span>
              <span className="text-xs text-gray-400 font-medium">
                {formatTime(transaction.date)}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className={`text-lg font-bold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                {isIncome ? '+ ' : '- '}
                {formatCurrency(transaction.amount)}
              </span>
              
              {!readOnly && (
                <button
                  onClick={() => onDelete(transaction.id)}
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Excluir"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TransactionList;