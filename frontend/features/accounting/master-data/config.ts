import type { MasterDataRecord } from '@/types/accounting';

export type MasterDataField = {
  key: string;
  label: string;
  type?: 'text' | 'email' | 'number' | 'date' | 'textarea' | 'select' | 'checkbox';
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
};

export type MasterDataResource = {
  key: string;
  title: string;
  description: string;
  path: string;
  route: string;
  permissions: {
    view: string;
    create: string;
    edit: string;
    deactivate: string;
  };
  fields: MasterDataField[];
  columns: Array<{ key: string; label: string; render?: (row: MasterDataRecord) => string }>;
};

export const MASTER_DATA_RESOURCES: MasterDataResource[] = [
  {
    key: 'contacts',
    title: 'Contacts',
    description: 'Customer, supplier, employee, and other accounting contacts.',
    path: '/master-data/contacts',
    route: '/accounting/master-data/contacts',
    permissions: {
      view: 'contacts.view',
      create: 'contacts.create',
      edit: 'contacts.edit',
      deactivate: 'contacts.deactivate',
    },
    fields: [
      { key: 'contact_code', label: 'Code' },
      { key: 'name', label: 'Name', required: true },
      {
        key: 'contact_type',
        label: 'Type',
        type: 'select',
        options: ['customer', 'supplier', 'employee', 'other'].map((value) => ({
          value,
          label: value,
        })),
      },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'phone', label: 'Phone' },
      { key: 'address', label: 'Address', type: 'textarea' },
      { key: 'tax_number', label: 'Tax Number' },
      { key: 'is_customer', label: 'Customer', type: 'checkbox' },
      { key: 'is_supplier', label: 'Supplier', type: 'checkbox' },
      { key: 'is_employee', label: 'Employee', type: 'checkbox' },
      { key: 'is_active', label: 'Active', type: 'checkbox' },
    ],
    columns: [
      { key: 'contact_code', label: 'Code' },
      { key: 'name', label: 'Name' },
      { key: 'contact_type', label: 'Type' },
      { key: 'email', label: 'Email' },
    ],
  },
  {
    key: 'units',
    title: 'Units',
    description: 'Measurement units for products and services.',
    path: '/master-data/units',
    route: '/accounting/master-data/units',
    permissions: {
      view: 'units.view',
      create: 'units.create',
      edit: 'units.edit',
      deactivate: 'units.deactivate',
    },
    fields: [
      { key: 'code', label: 'Code', required: true },
      { key: 'name', label: 'Name', required: true },
      { key: 'precision', label: 'Precision', type: 'number' },
      { key: 'is_active', label: 'Active', type: 'checkbox' },
    ],
    columns: [
      { key: 'code', label: 'Code' },
      { key: 'name', label: 'Name' },
      { key: 'precision', label: 'Precision' },
    ],
  },
  {
    key: 'product-categories',
    title: 'Product Categories',
    description: 'Grouping for accounting product masters.',
    path: '/master-data/product-categories',
    route: '/accounting/master-data/product-categories',
    permissions: {
      view: 'products.view',
      create: 'products.create',
      edit: 'products.edit',
      deactivate: 'products.deactivate',
    },
    fields: [
      { key: 'name', label: 'Name', required: true },
      { key: 'parent_category_id', label: 'Parent Category ID', type: 'number' },
      { key: 'is_active', label: 'Active', type: 'checkbox' },
    ],
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'parent_category_id', label: 'Parent ID' },
    ],
  },
  {
    key: 'products',
    title: 'Products',
    description: 'Product and service master data used by future operating modules.',
    path: '/master-data/products',
    route: '/accounting/master-data/products',
    permissions: {
      view: 'products.view',
      create: 'products.create',
      edit: 'products.edit',
      deactivate: 'products.deactivate',
    },
    fields: [
      { key: 'product_code', label: 'Code' },
      { key: 'product_name', label: 'Name', required: true },
      {
        key: 'product_type',
        label: 'Type',
        type: 'select',
        options: ['goods', 'service', 'non_inventory'].map((value) => ({ value, label: value })),
      },
      { key: 'product_category_id', label: 'Category ID', type: 'number' },
      { key: 'unit_id', label: 'Unit ID', type: 'number' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'is_stock_item', label: 'Stock Item', type: 'checkbox' },
      { key: 'is_active', label: 'Active', type: 'checkbox' },
    ],
    columns: [
      { key: 'product_code', label: 'Code' },
      { key: 'product_name', label: 'Name' },
      { key: 'product_type', label: 'Type' },
      { key: 'is_stock_item', label: 'Stock' },
    ],
  },
  {
    key: 'warehouses',
    title: 'Warehouses',
    description: 'Warehouse masters only; stock operations stay in later frontend phases.',
    path: '/master-data/warehouses',
    route: '/accounting/master-data/warehouses',
    permissions: {
      view: 'warehouses.view',
      create: 'warehouses.create',
      edit: 'warehouses.edit',
      deactivate: 'warehouses.deactivate',
    },
    fields: [
      { key: 'code', label: 'Code', required: true },
      { key: 'name', label: 'Name', required: true },
      { key: 'address', label: 'Address', type: 'textarea' },
      { key: 'is_default', label: 'Default', type: 'checkbox' },
      { key: 'is_active', label: 'Active', type: 'checkbox' },
    ],
    columns: [
      { key: 'code', label: 'Code' },
      { key: 'name', label: 'Name' },
      { key: 'is_default', label: 'Default' },
    ],
  },
  {
    key: 'departments',
    title: 'Departments',
    description: 'Analytical department dimensions for journals and reports.',
    path: '/master-data/departments',
    route: '/accounting/master-data/departments',
    permissions: {
      view: 'departments.view',
      create: 'departments.create',
      edit: 'departments.edit',
      deactivate: 'departments.deactivate',
    },
    fields: [
      { key: 'code', label: 'Code', required: true },
      { key: 'name', label: 'Name', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'is_active', label: 'Active', type: 'checkbox' },
    ],
    columns: [
      { key: 'code', label: 'Code' },
      { key: 'name', label: 'Name' },
    ],
  },
  {
    key: 'projects',
    title: 'Projects',
    description: 'Analytical project dimensions for journals and reports.',
    path: '/master-data/projects',
    route: '/accounting/master-data/projects',
    permissions: {
      view: 'projects.view',
      create: 'projects.create',
      edit: 'projects.edit',
      deactivate: 'projects.deactivate',
    },
    fields: [
      { key: 'code', label: 'Code', required: true },
      { key: 'name', label: 'Name', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'start_date', label: 'Start Date', type: 'date' },
      { key: 'end_date', label: 'End Date', type: 'date' },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: ['active', 'completed', 'on_hold', 'cancelled'].map((value) => ({
          value,
          label: value,
        })),
      },
      { key: 'is_active', label: 'Active', type: 'checkbox' },
    ],
    columns: [
      { key: 'code', label: 'Code' },
      { key: 'name', label: 'Name' },
      { key: 'status', label: 'Status' },
    ],
  },
];

export function getMasterDataResource(key: string): MasterDataResource {
  const resource = MASTER_DATA_RESOURCES.find((item) => item.key === key);
  if (!resource) throw new Error(`Unknown master data resource: ${key}`);
  return resource;
}
