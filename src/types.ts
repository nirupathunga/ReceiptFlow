export type TransactionType = 'expense' | 'income' | 'transfer';

export type BudgetGroup = 'Needs' | 'Wants' | 'Savings & Debt';

export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
}

export interface ReceiptData {
  id: string;
  merchantName: string;
  address?: string;
  date: string;
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  tipAmount?: number;
  paymentMethod: string;
  lastFourDigits?: string;
  items: ReceiptItem[];
  confidenceScore: number;
  notes?: string;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  rawDate?: string;
  merchant: string;
  amount: number;
  type: TransactionType;
  category: string;
  subcategory?: string;
  paymentMethod: string;
  status: 'cleared' | 'pending';
  receipt?: ReceiptData;
  notes?: string;
  isSubscription?: boolean;
  tags: string[];
  currency?: string;
}

export interface CategoryBudget {
  id: string;
  name: string;
  group: BudgetGroup;
  budgetAmount: number;
  icon: string;
  color: string;
  accentBg: string;
}

export interface MonthlyStats {
  month: string; // YYYY-MM
  label: string;
  income: number;
  expense: number;
  savings: number;
  savingsRate: number;
}

export type ActiveTab = 'overview' | 'story' | 'transactions' | 'categories' | 'analytics';
