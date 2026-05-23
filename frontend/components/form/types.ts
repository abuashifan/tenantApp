import type { ReactNode } from 'react';

export type FormOption = {
  value: string;
  label: string;
  description?: string;
  meta?: ReactNode;
  disabled?: boolean;
};

export type FieldErrorMap = Record<string, string | string[] | undefined>;

export type FormAction = {
  key: string;
  label: string;
  type?: 'button' | 'submit';
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  danger?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
};

export type SummaryPanelRow = {
  key: string;
  label: string;
  value: string | number;
  emphasized?: boolean;
  warning?: boolean;
};

