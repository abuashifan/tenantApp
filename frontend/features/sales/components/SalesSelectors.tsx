'use client';

import type { ChartOfAccount, Department, MasterDataRecord, Project } from '@/types/accounting';

type SelectorProps<T> = {
  label: string;
  value: string;
  options: T[];
  onChange: (value: string) => void;
  placeholder?: string;
  getValue: (option: T) => string | number;
  getLabel: (option: T) => string;
};

function Selector<T>({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select',
  getValue,
  getLabel,
}: SelectorProps<T>) {
  return (
    <label>
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={String(getValue(option))} value={String(getValue(option))}>
            {getLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CustomerSelector(props: {
  value: string;
  contacts: MasterDataRecord[];
  onChange: (value: string) => void;
}) {
  return (
    <Selector
      label="Customer"
      value={props.value}
      options={props.contacts}
      onChange={props.onChange}
      getValue={(contact) => contact.id}
      getLabel={(contact) => `${contact.contact_code ?? contact.id} - ${contact.name ?? 'Unnamed'}`}
    />
  );
}

export function ProductSelector(props: {
  value: string;
  products: MasterDataRecord[];
  onChange: (value: string) => void;
}) {
  return (
    <Selector
      label="Product"
      value={props.value}
      options={props.products}
      onChange={props.onChange}
      getValue={(product) => product.id}
      getLabel={(product) => `${product.product_code ?? product.id} - ${product.product_name ?? 'Unnamed'}`}
    />
  );
}

export function UnitSelector(props: {
  value: string;
  units: MasterDataRecord[];
  onChange: (value: string) => void;
}) {
  return (
    <Selector
      label="Unit"
      value={props.value}
      options={props.units}
      onChange={props.onChange}
      getValue={(unit) => unit.id}
      getLabel={(unit) => `${unit.code ?? unit.id} - ${unit.name ?? 'Unnamed'}`}
    />
  );
}

export function WarehouseSelector(props: {
  value: string;
  warehouses: MasterDataRecord[];
  onChange: (value: string) => void;
}) {
  return (
    <Selector
      label="Warehouse"
      value={props.value}
      options={props.warehouses}
      onChange={props.onChange}
      getValue={(warehouse) => warehouse.id}
      getLabel={(warehouse) => `${warehouse.code ?? warehouse.id} - ${warehouse.name ?? 'Unnamed'}`}
    />
  );
}

export function DepartmentSelector(props: {
  value: string;
  departments: Department[];
  onChange: (value: string) => void;
}) {
  return (
    <Selector
      label="Department"
      value={props.value}
      options={props.departments}
      onChange={props.onChange}
      getValue={(department) => department.id}
      getLabel={(department) => `${department.code} - ${department.name}`}
    />
  );
}

export function ProjectSelector(props: {
  value: string;
  projects: Project[];
  onChange: (value: string) => void;
}) {
  return (
    <Selector
      label="Project"
      value={props.value}
      options={props.projects}
      onChange={props.onChange}
      getValue={(project) => project.id}
      getLabel={(project) => `${project.code} - ${project.name}`}
    />
  );
}

export function SalesAccountSelector(props: {
  value: string;
  accounts: ChartOfAccount[];
  onChange: (value: string) => void;
}) {
  return (
    <Selector
      label="Account"
      value={props.value}
      options={props.accounts}
      onChange={props.onChange}
      getValue={(account) => account.id}
      getLabel={(account) => `${account.account_code} - ${account.account_name}`}
    />
  );
}
