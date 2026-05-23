import type { ReactNode } from 'react';

export type WorkspaceRowId = string | number;

export type WorkspaceRow = {
  id: WorkspaceRowId;
};

export type WorkspaceColumn<T extends WorkspaceRow> = {
  key: string;
  label: string;
  widthClassName?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  render: (row: T) => ReactNode;
};

export type WorkspaceFilterState = {
  search: string;
  status: string;
  party: string;
  dateFrom: string;
  dateTo: string;
};

export type WorkspaceSelectOption = {
  label: string;
  value: string;
};

export type WorkspaceRowAction<T extends WorkspaceRow> = {
  key: string;
  label: string;
  icon?: ReactNode;
  href?: (row: T) => string;
  onClick?: (row: T) => void;
  disabled?: (row: T) => boolean;
  danger?: boolean;
};

export type WorkspaceBulkAction = {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: (selectedIds: WorkspaceRowId[]) => void;
  danger?: boolean;
  disabled?: boolean;
};
