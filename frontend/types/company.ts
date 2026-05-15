export type Company = {
  id: number;
  name: string;
  legal_name?: string | null;
  slug: string;
  code: string;
  status: string;
  user_role: string;
  tenant_database?: {
    database_name: string;
    status: string;
  } | null;
};

export type ActiveCompany = {
  id: number;
  name: string;
  legal_name?: string | null;
  slug: string;
  code: string;
  user_role: string;
  tenant_database: {
    database_name: string;
    database_path: string;
    status: string;
  };
};

export type TenantContextTest = {
  company_id: number;
  company_name: string;
  database_name: string;
  database_path: string;
  user_role: string;
};

