// User Schemas
export interface User {
  id: number;
  email: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
}

export interface UserRegister {
  email: string;
  password: string;
  full_name?: string;
}

export interface UserLogin {
  username: string; // OAuth2 username field (email)
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// Expense Schemas
export interface Expense {
  id: number;
  user_id: number;
  title: string;
  amount: number;
  category: string;
  category_id?: number | null;
  expense_date: string;
}

export interface ExpenseCreate {
  title: string;
  amount: number;
  category?: string;
  category_id?: number | null;
  expense_date?: string;
}

export interface ExpenseUpdate {
  title?: string;
  amount?: number;
  category?: string;
  category_id?: number | null;
  expense_date?: string;
}

export interface PaginatedExpenses {
  items: Expense[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface ExpenseFilterParams {
  page?: number;
  page_size?: number;
  category?: string;
  start_date?: string;
  end_date?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Category Schemas
export interface Category {
  id: number;
  name: string;
  user_id: number;
  created_at: string;
}

export interface CategoryCreate {
  name: string;
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
}

export interface BudgetCreate {
  category_id: number;
  monthly_limit: number;
  month: number;
  year: number;
}

// Analytics Schemas
export interface MonthlySummary {
  month: number;
  year: number;
  total_spent: number;
  total_transactions: number;
}

export interface CategorySpending {
  category: string;
  total_spent: number;
  percentage: number;
}

export interface CategorySpendingResponse {
  month: number;
  year: number;
  total_spent: number;
  categories: CategorySpending[];
}

export interface BudgetStatusItem {
  category_id: number;
  category_name: string;
  monthly_limit: number;
  total_spent: number;
  remaining: number;
  is_exceeded: boolean;
}

export interface BudgetStatusResponse {
  month: number;
  year: number;
  budgets: BudgetStatusItem[];
}

// Global API Error Response Schema
export interface APIError {
  error: {
    code: number;
    message: string;
    type: string;
    details?: any;
  };
}
