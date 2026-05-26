import { api } from '@/services/api'
import type { ApiResponse } from '@/types/api'

type ConvertedDocument = Record<string, unknown>

function convert(endpoint: string, payload?: Record<string, unknown>) {
  return api.post<ApiResponse<ConvertedDocument>>(endpoint, payload ?? {})
}

export const salesSourceConversions = {
  deliveryOrderFromSalesOrder(id: string | number) {
    return convert(`/sales/delivery-orders/from-sales-order/${id}`)
  },
  proformaFromSalesOrder(id: string | number) {
    return convert(`/sales/proformas/from-sales-order/${id}`)
  },
  invoiceFromSalesOrder(id: string | number) {
    return convert(`/sales/invoices/from-sales-order/${id}`)
  },
  invoiceFromDeliveryOrder(id: string | number) {
    return convert(`/sales/invoices/from-delivery-order/${id}`)
  },
  invoiceFromProforma(id: string | number) {
    return convert(`/sales/invoices/from-proforma/${id}`)
  },
}

export const purchaseSourceConversions = {
  orderFromRequest(id: string | number, payload?: Record<string, unknown>) {
    return convert(`/purchase/orders/from-request/${id}`, payload)
  },
  goodsReceiptFromPurchaseOrder(id: string | number) {
    return convert(`/purchase/goods-receipts/from-purchase-order/${id}`)
  },
  billFromPurchaseOrder(id: string | number) {
    return convert(`/purchase/bills/from-purchase-order/${id}`)
  },
  billFromGoodsReceipt(id: string | number) {
    return convert(`/purchase/bills/from-goods-receipt/${id}`)
  },
}
