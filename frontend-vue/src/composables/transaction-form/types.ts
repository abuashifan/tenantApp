import type { ZodTypeAny } from 'zod'

export type TransactionPartnerType = 'customer' | 'vendor' | 'none'
export type TransactionFormMode = 'create' | 'edit' | 'detail'

export type TransactionSourceOption = {
  key: string
  label: string
  sourceType?: string
}

export type TransactionActionKey =
  | 'save'
  | 'send'
  | 'submit'
  | 'approve'
  | 'accept'
  | 'reject'
  | 'confirm'
  | 'ready'
  | 'ship'
  | 'deliver'
  | 'receive'
  | 'issue'
  | 'post'
  | 'refund'
  | 'void'
  | 'cancel'
  | 'close'
  | 'print'

export type TransactionActionConfig = {
  key: TransactionActionKey
  label: string
  variant?: 'primary' | 'secondary' | 'danger'
  requiresConfirm?: boolean
  requiresReason?: boolean
  confirmTitle?: string
  confirmMessage?: string
  permission?: string
  whenStatusIn?: string[]
}

export type TransactionConversionConfig = {
  key: string
  label: string
  permission: string
  whenStatusIn: string[]
  targetPrimaryTabId: string
  targetLabel: string
  targetNumberField: string
  execute(id: string | number, payload?: Record<string, unknown>): Promise<unknown>
  buildPayload?(): Record<string, unknown> | null
}

export type TransactionLineProductConfig = {
  priceMode: 'sales' | 'purchase' | 'none'
  priceField?: 'unit_price' | 'estimated_unit_price' | 'amount'
  priceLabel?: string
}

export type TransactionApiService = {
  endpoint: string
  list(params?: Record<string, unknown>): Promise<unknown>
  get(id: string | number): Promise<unknown>
  create(payload: unknown): Promise<unknown>
  update(id: string | number, payload: unknown): Promise<unknown>
  action?(key: string, id: string | number, payload?: unknown): Promise<unknown>
}

export type TransactionFormConfig<TValues extends Record<string, unknown> = Record<string, unknown>> = {
  moduleKey: 'sales' | 'purchase'
  documentType: string
  title: string
  primaryTabId: string
  listEndpoint: string
  numberField: keyof TValues & string
  dateField: keyof TValues & string
  partnerType: TransactionPartnerType
  partnerField?: keyof TValues & string
  apiService: TransactionApiService
  permissions: {
    view: string
    create: string
    edit: string
    approve?: string
    confirm?: string
    post?: string
    void?: string
    cancel?: string
    close?: string
    print?: string
    send?: string
    submit?: string
    accept?: string
    reject?: string
    ready?: string
    ship?: string
    deliver?: string
    receive?: string
    issue?: string
    refund?: string
  }
  sourceOptions?: TransactionSourceOption[]
  actions: TransactionActionConfig[]
  conversions?: TransactionConversionConfig[]
  validationSchema: ZodTypeAny
  hasLines?: boolean
  lineProduct?: TransactionLineProductConfig
  makeEmptyValues(): TValues
}

export type RuntimeTransactionFormConfig = Omit<
  TransactionFormConfig<Record<string, unknown>>,
  'numberField' | 'dateField' | 'partnerField' | 'makeEmptyValues'
> & {
  numberField: string
  dateField: string
  partnerField?: string
  makeEmptyValues(): Record<string, unknown>
}
