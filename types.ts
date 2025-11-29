
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: Date; // ISO string
}

export type TimeRange = 'today' | '7days' | '30days' | '1year';

export interface User {
  name: string;
  email: string;
  avatarUrl: string;
  // Campos adicionais do cadastro da empresa
  companyName?: string;
  companyDocument?: string; // CPF ou CNPJ
  phone?: string;
}
