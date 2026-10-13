// User Schemas
export type Currency = 'EUR' | 'USD' | 'INR';

export interface User {
  id: number;
  email: string;
  username?: string;
  full_name?: string;
  default_currency: Currency;
  is_active: boolean;
  created_at: string;
}

export interface UserRegister {
  email: string;
  password: string;
  full_name?: string;
  default_currency?: Currency;
}

export interface UserUpdate {
  full_name?: string;
  default_currency?: Currency;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// Account Schemas
export type AccountType = 'bank' | 'cash' | 'savings' | 'credit_card' | 'investment';

export interface Account {
  id: number;
  user_id: number;
  name: string;
  account_type: AccountType;
  currency: Currency;
  initial_balance?: number | string | null;
  current_balance?: number | string | null;
  is_balance_set?: boolean;
  total_income: number | string;
  total_expenses: number | string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface AccountCreate {
  name: string;
  account_type: AccountType;
  currency: Currency;
  initial_balance?: number | null;
}

export interface AccountUpdate {
  name?: string;
  account_type?: AccountType;
  currency?: Currency;
  initial_balance?: number | null;
  is_active?: boolean;
}

export interface AccountListResponse {
  accounts: Account[];
  total_balance?: number | string | null;
  is_balance_set?: boolean;
}

// Transaction / Expense Schemas
export type TransactionType = 'expense' | 'income' | 'transfer' | 'refund';

export interface Expense {
  id: number;
  user_id: number;
  title: string;
  amount: number | string;
  transaction_type: TransactionType;
  category: string;
  category_id?: number | null;
  subcategory_id?: number | null;
  subcategory_name?: string | null;
  account_id?: number | null;
  account_name?: string | null;
  expense_date: string;
  notes?: string | null;
  category_icon?: string;
  category_color?: string;
}

export interface ExpenseCreate {
  title: string;
  amount: number;
  transaction_type?: TransactionType;
  category?: string;
  category_id?: number | null;
  subcategory_id?: number | null;
  account_id?: number | null;
  expense_date?: string;
  notes?: string | null;
}

export interface ExpenseUpdate {
  title?: string;
  amount?: number;
  transaction_type?: TransactionType;
  category?: string;
  category_id?: number | null;
  subcategory_id?: number | null;
  account_id?: number | null;
  expense_date?: string;
  notes?: string | null;
}

export interface PaginatedExpenses {
  items: Expense[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
  total_income?: number | string;
  total_expenses?: number | string;
  total_refunds?: number | string;
  net_expenses?: number | string;
}

export interface ExpenseFilterParams {
  page?: number;
  page_size?: number;
  type?: TransactionType;
  category?: string;
  account_id?: number;
  search?: string;
  start_date?: string;
  end_date?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Transfer Schemas
export interface TransferCreate {
  from_account_id: number;
  to_account_id: number;
  amount: number;
  description?: string;
  date?: string;
}

export interface TransferResponse {
  transfer_out_id: number;
  transfer_in_id: number;
  from_account_id: number;
  to_account_id: number;
  amount: number | string;
  description?: string | null;
  date: string;
}

// Category Schemas
export interface Subcategory {
  id: number;
  name: string;
  category_type: 'expense' | 'income';
  icon: string;
  color: string;
  parent_id?: number | null;
  user_id: number;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  category_type: 'expense' | 'income';
  icon: string;
  color: string;
  parent_id?: number | null;
  user_id: number;
  is_default: boolean;
  created_at: string;
  subcategories: Subcategory[];
  transaction_count?: number;
}

export interface CategoryCreate {
  name: string;
  category_type?: 'expense' | 'income';
  icon?: string;
  color?: string;
  parent_id?: number | null;
}

export interface CategoryUpdate {
  name?: string;
  category_type?: 'expense' | 'income';
  icon?: string;
  color?: string;
  parent_id?: number | null;
}

// Budget Schemas
export interface Budget {
  id: number;
  category_id: number;
  user_id: number;
  monthly_limit: number;
  month: number;
  year: number;
  created_at: string;
  category_name?: string;
  category_icon?: string;
  category_color?: string;
}

export interface BudgetCreate {
  category_id: number;
  monthly_limit: number;
  month: number;
  year: number;
}

// Recurring Transaction Schemas
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringTransaction {
  id: number;
  user_id: number;
  title: string;
  amount: number;
  transaction_type: 'expense' | 'income';
  account_id?: number | null;
  account_name?: string | null;
  category_id?: number | null;
  category_name?: string | null;
  category_icon?: string;
  category_color?: string;
  frequency: RecurrenceFrequency;
  start_date: string;
  end_date?: string | null;
  day_of_month?: number | null;
  is_active: boolean;
  notes?: string | null;
  next_due_date?: string | null;
  days_until_due?: number | null;
  created_at: string;
}

export interface RecurringTransactionCreate {
  title: string;
  amount: number;
  transaction_type?: 'expense' | 'income';
  account_id?: number | null;
  category_id?: number | null;
  frequency?: RecurrenceFrequency;
  start_date?: string;
  end_date?: string | null;
  day_of_month?: number | null;
  is_active?: boolean;
  notes?: string | null;
}

export interface RecurringTransactionUpdate {
  title?: string;
  amount?: number;
  transaction_type?: 'expense' | 'income';
  account_id?: number | null;
  category_id?: number | null;
  frequency?: RecurrenceFrequency;
  start_date?: string;
  end_date?: string | null;
  day_of_month?: number | null;
  is_active?: boolean;
  notes?: string | null;
}

export interface UpcomingSummaryResponse {
  items: RecurringTransaction[];
  total_upcoming_expenses: number;
  total_upcoming_income: number;
}

// Analytics Schemas
export interface MonthlySummary {
  month: number;
  year: number;
  total_income: number | string;
  total_spent: number | string;
  gross_spending?: number | string;
  total_refunds?: number | string;
  net_spending?: number | string;
  net_savings: number | string;
  savings_rate: number;
  total_transactions: number;
  fixed_expenses: number | string;
  variable_expenses: number | string;
  average_daily_spending: number | string;
  total_balance?: number | string | null;
  is_balance_set?: boolean;
}

export interface CategorySpending {
  category_id?: number | null;
  category: string;
  icon: string;
  color: string;
  total_spent: number | string;
  percentage: number;
  transaction_count: number;
}

export interface CategorySpendingResponse {
  month: number;
  year: number;
  total_spent: number;
  categories: CategorySpending[];
}

export interface BudgetStatusItem {
  budget_id: number;
  category_id: number;
  category_name: string;
  category_icon: string;
  category_color: string;
  monthly_limit: number;
  total_spent: number;
  remaining: number;
  percentage: number;
  is_exceeded: boolean;
  status: 'on_track' | 'warning' | 'exceeded';
}

export interface BudgetStatusResponse {
  month: number;
  year: number;
  total_budgeted: number;
  total_spent_budgeted: number;
  budgets: BudgetStatusItem[];
}

export interface CashFlowPoint {
  date: string;
  income: number;
  expense: number;
  net: number;
}

export interface CashFlowResponse {
  month: number;
  year: number;
  points: CashFlowPoint[];
}
