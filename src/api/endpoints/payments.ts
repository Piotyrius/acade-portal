  import api from '@/api/client';

  // ============================================================================
  // Types
  // ============================================================================

  export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
  }

  // ============================================================================
  // Discount DTOs
  // ============================================================================

  export interface DiscountDto {
    id: string;
    name: string;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT';
    value: string; // Decimal string
    applicable_to: 'FULL_PAYMENT' | 'SIBLING' | 'CUSTOM';
    code?: string;
    min_amount?: string;
    max_discount?: string;
    is_active: boolean;
    valid_from: string;
    valid_to?: string;
    created_at: string;
    updated_at: string;
    organization?: string;
    type_display?: string;
    applicable_to_display?: string;
  }

  export interface DiscountRequest {
    name: string;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT';
    value: string;
    applicable_to: 'FULL_PAYMENT' | 'SIBLING' | 'CUSTOM';
    code?: string;
    min_amount?: string;
    max_discount?: string;
    is_active?: boolean;
    valid_from: string;
    valid_to?: string;
    organization?: string;
  }

  export interface PatchedDiscountRequest extends Partial<DiscountRequest> {}

  // ============================================================================
  // Invoice DTOs
  // ============================================================================

  export interface InvoiceDto {
    id: string;
    enrollment: string;
    payment_plan?: string;
    pricing?: string;
    subtotal: string;
    discount_amount?: string;
    total_amount: string;
    paid_amount?: string;
    outstanding_amount?: string;
    status: 'DRAFT' | 'ISSUED' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';
    due_date: string;
    issued_at?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    organization?: string;
    invoice_number?: string;
    student_name?: string;
    cohort_name?: string;
    payment_plan_name?: string;
    status_display?: string;
  }

  export interface InvoiceRequest {
    enrollment: string;
    payment_plan?: string;
    pricing?: string;
    subtotal: string;
    discount_amount?: string;
    total_amount: string;
    paid_amount?: string;
    status?: 'DRAFT' | 'ISSUED' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';
    due_date: string;
    issued_at?: string;
    notes?: string;
    organization?: string;
  }

  export interface PatchedInvoiceRequest extends Partial<InvoiceRequest> {}

  // ============================================================================
  // Payment Method DTOs
  // ============================================================================

  export interface PaymentMethodDto {
    id: string;
    name: string;
    code?: string;
    is_active: boolean;
    requires_receipt?: boolean;
    created_at: string;
    updated_at: string;
    organization?: string;
  }

  export interface PaymentMethodRequest {
    name: string;
    code?: string;
    is_active?: boolean;
    requires_receipt?: boolean;
    organization?: string;
  }

  export interface PatchedPaymentMethodRequest extends Partial<PaymentMethodRequest> {}

  // ============================================================================
  // Payment Plan DTOs
  // ============================================================================

  export interface PaymentPlanDto {
    id: string;
    name: string;
    type: 'MONTHLY' | 'FULL' | 'CUSTOM';
    installment_count?: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    organization?: string;
    type_display?: string;
  }

  export interface PaymentPlanRequest {
    name: string;
    type: 'MONTHLY' | 'FULL' | 'CUSTOM';
    installment_count?: number;
    is_active?: boolean;
    organization?: string;
  }

  export interface PatchedPaymentPlanRequest extends Partial<PaymentPlanRequest> {}

  // ============================================================================
  // Payment Schedule DTOs
  // ============================================================================

  export interface PaymentScheduleDto {
    id: string;
    invoice: string;
    scheduled_date: string;
    amount: string;
    status: 'PENDING' | 'PAID' | 'OVERDUE' | 'SKIPPED';
    created_at: string;
    updated_at: string;
    invoice_number?: string;
    status_display?: string;
  }

  export interface PaymentScheduleRequest {
    invoice: string;
    scheduled_date: string;
    amount: string;
  }

  export interface PatchedPaymentScheduleRequest extends Partial<PaymentScheduleRequest> {}

  // ============================================================================
  // Payment DTOs
  // ============================================================================

  export interface PaymentDto {
    id: string;
    invoice: string;
    student: string;
    // Optional computed fields (backend may include these)
    enrollment?: string;
    invoice_number?: string;
    student_name?: string;
    cohort_name?: string;
    payment_method: 'MANUAL' | 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CHECK' | 'OTHER';
    amount: string;
    currency: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    transaction_id?: string;
    notes?: string;
    processed_at: string;
    created_at: string;
    updated_at: string;
  }

  export interface PaymentRequest {
    amount: string;
    currency: string;
    payment_method: 'MANUAL' | 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CHECK' | 'OTHER';

    payment_gateway: 'MANUAL'; // probably always MANUAL
    gateway_transaction_id?: string;
    gateway_response?: string;

    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

    payment_date: string; // FULL ISO: "2025-12-11T13:17:00Z"
    notes?: string;

    refund_amount?: string;
    refund_reason?: string;
processed_at: string;
  organization: string;
  recorded_by: string;
    invoice: string;
    student: string;
  }


  export interface PatchedPaymentRequest extends Partial<PaymentRequest> {}

  // ============================================================================
  // Pricing DTOs
  // ============================================================================

  export interface PricingDto {
    id: string;
    object_id: string;
    // Backend may include the Django ContentType id for the priced object.
    content_type?: number;
    amount: string;
    currency: string;
    effective_from: string;
    effective_to?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    organization?: string;
    pricing_object_name?: string;
  }

  export interface PricingRequest {
    object_id: string;
    content_type: number;
    amount: string;
    currency: string;
    effective_from: string;
    effective_to?: string;
    is_active?: boolean;
    organization?: string;
  }

  export interface PatchedPricingRequest extends Partial<PricingRequest> {}

  // ============================================================================
  // Discount API Functions
  // ============================================================================

  export async function getDiscounts(params?: {
    is_active?: boolean;
    type?: 'PERCENTAGE' | 'FIXED_AMOUNT';
    applicable_to?: 'FULL_PAYMENT' | 'SIBLING' | 'CUSTOM';
    search?: string;
    ordering?: string;
    page?: number;
  }): Promise<DiscountDto[]> {
    const { data } = await api.get('/api/v1/payments/discounts/', { params });
    return data.results || data;
  }

  export async function getDiscount(id: string): Promise<DiscountDto> {
    const { data } = await api.get(`/api/v1/payments/discounts/${id}/`);
    return data;
  }

  export async function createDiscount(payload: DiscountRequest): Promise<DiscountDto> {
    const { data } = await api.post('/api/v1/payments/discounts/', payload);
    return data;
  }

  export async function updateDiscount(id: string, payload: PatchedDiscountRequest): Promise<DiscountDto> {
    const { data } = await api.patch(`/api/v1/payments/discounts/${id}/`, payload);
    return data;
  }

  export async function deleteDiscount(id: string): Promise<void> {
    await api.delete(`/api/v1/payments/discounts/${id}/`);
  }

  // ============================================================================
  // Invoice API Functions
  // ============================================================================

  export async function getInvoices(params?: {
    enrollment?: string;
    payment_plan?: string;
    status?: 'DRAFT' | 'ISSUED' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';
    search?: string;
    ordering?: string;
    page?: number;
  }): Promise<InvoiceDto[]> {
    const { data } = await api.get('/api/v1/payments/invoices/', { params });
    return data.results || data;
  }

  export async function getInvoice(id: string): Promise<InvoiceDto> {
    const { data } = await api.get(`/api/v1/payments/invoices/${id}/`);
    return data;
  }

  export async function createInvoice(payload: InvoiceRequest): Promise<InvoiceDto> {
    const { data } = await api.post('/api/v1/payments/invoices/', payload);
    return data;
  }

  export async function updateInvoice(id: string, payload: PatchedInvoiceRequest): Promise<InvoiceDto> {
    const { data } = await api.patch(`/api/v1/payments/invoices/${id}/`, payload);
    return data;
  }

  export async function deleteInvoice(id: string): Promise<void> {
    await api.delete(`/api/v1/payments/invoices/${id}/`);
  }

  export async function applyDiscountsToInvoice(id: string, discountIds: string[]): Promise<InvoiceDto> {
    const { data } = await api.post(`/api/v1/payments/invoices/${id}/apply_discounts/`, { discount_ids: discountIds });
    return data;
  }

  export async function issueInvoice(id: string): Promise<InvoiceDto> {
    const { data } = await api.post(`/api/v1/payments/invoices/${id}/issue/`);
    return data;
  }

  export async function getInvoiceOutstandingBalance(id: string): Promise<{
    invoice_number: string;
    total_amount: string;
    paid_amount: string;
    outstanding_amount: string;
    status: string;
  }> {
    const { data } = await api.get(`/api/v1/payments/invoices/${id}/outstanding_balance/`);
    return data;
  }

  export async function createInvoiceForEnrollment(
    enrollmentId: string,
    paymentPlanId: string,
    discountIds?: string[]
  ): Promise<InvoiceDto> {
    const payload: { enrollment: string; payment_plan: string; discounts?: string[] } = {
      enrollment: enrollmentId,
      payment_plan: paymentPlanId,
    };
    if (discountIds && discountIds.length > 0) {
      payload.discounts = discountIds;
    }
    const { data } = await api.post('/api/v1/payments/invoices/create_for_enrollment/', payload);
    return data;
  }

  // ============================================================================
  // Payment Method API Functions
  // ============================================================================

  export async function getPaymentMethods(params?: {
    is_active?: boolean;
    search?: string;
    ordering?: string;
    page?: number;
  }): Promise<PaymentMethodDto[]> {
    const { data } = await api.get('/api/v1/payments/payment-methods/', { params });
    return data.results || data;
  }

  export async function getPaymentMethod(id: string): Promise<PaymentMethodDto> {
    const { data } = await api.get(`/api/v1/payments/payment-methods/${id}/`);
    return data;
  }

  export async function createPaymentMethod(payload: PaymentMethodRequest): Promise<PaymentMethodDto> {
    const { data } = await api.post('/api/v1/payments/payment-methods/', payload);
    return data;
  }

  export async function updatePaymentMethod(id: string, payload: PatchedPaymentMethodRequest): Promise<PaymentMethodDto> {
    const { data } = await api.patch(`/api/v1/payments/payment-methods/${id}/`, payload);
    return data;
  }

  export async function deletePaymentMethod(id: string): Promise<void> {
    await api.delete(`/api/v1/payments/payment-methods/${id}/`);
  }

  // ============================================================================
  // Payment Plan API Functions
  // ============================================================================

  export async function getPaymentPlans(params?: {
    is_active?: boolean;
    type?: 'MONTHLY' | 'FULL' | 'CUSTOM';
    search?: string;
    ordering?: string;
    page?: number;
  }): Promise<PaymentPlanDto[]> {
    const { data } = await api.get('/api/v1/payments/payment-plans/', { params });
    return data.results || data;
  }

  export async function getPaymentPlan(id: string): Promise<PaymentPlanDto> {
    const { data } = await api.get(`/api/v1/payments/payment-plans/${id}/`);
    return data;
  }

  export async function createPaymentPlan(payload: PaymentPlanRequest): Promise<PaymentPlanDto> {
    const { data } = await api.post('/api/v1/payments/payment-plans/', payload);
    return data;
  }

  export async function updatePaymentPlan(id: string, payload: PatchedPaymentPlanRequest): Promise<PaymentPlanDto> {
    const { data } = await api.patch(`/api/v1/payments/payment-plans/${id}/`, payload);
    return data;
  }

  export async function deletePaymentPlan(id: string): Promise<void> {
      const primaryUrl = `/api/v1/payments/payment-plans/${id}/`;
      try {
        await api.delete(primaryUrl);
      } catch (error: any) {
        const status = error?.response?.status;
        // Some deployments expose DRF routes with underscores instead of hyphens.
        if (status === 404) {
          await api.delete(`/api/v1/payments/payment_plans/${id}/`);
          return;
        }
        throw error;
      }
  }

  // ============================================================================
  // Payment Schedule API Functions
  // ============================================================================

  export async function getPaymentSchedules(params?: {
    invoice?: string;
    status?: 'PENDING' | 'PAID' | 'OVERDUE' | 'SKIPPED';
    search?: string;
    ordering?: string;
    page?: number;
  }): Promise<PaymentScheduleDto[]> {
    const { data } = await api.get('/api/v1/payments/payment-schedules/', { params });
    return data.results || data;
  }

  export async function getPaymentSchedule(id: string): Promise<PaymentScheduleDto> {
    const { data } = await api.get(`/api/v1/payments/payment-schedules/${id}/`);
    return data;
  }

  export async function createPaymentSchedule(payload: PaymentScheduleRequest): Promise<PaymentScheduleDto> {
    const { data } = await api.post('/api/v1/payments/payment-schedules/', payload);
    return data;
  }

  export async function updatePaymentSchedule(id: string, payload: PatchedPaymentScheduleRequest): Promise<PaymentScheduleDto> {
    const { data } = await api.patch(`/api/v1/payments/payment-schedules/${id}/`, payload);
    return data;
  }

  export async function deletePaymentSchedule(id: string): Promise<void> {
    await api.delete(`/api/v1/payments/payment-schedules/${id}/`);
  }

  export async function markPaymentSchedulesOverdue(): Promise<{ marked_overdue: number }> {
    const { data } = await api.post('/api/v1/payments/payment-schedules/mark_overdue/');
    return data;
  }

  // ============================================================================
  // Payment API Functions
  // ============================================================================

  export async function getPayments(params?: {
    invoice?: string;
    student?: string;
    payment_method?: 'MANUAL' | 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CHECK' | 'OTHER';
    status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    search?: string;
    ordering?: string;
    page?: number;
  }): Promise<PaymentDto[]> {
    const { data } = await api.get('/api/v1/payments/payments/', { params });
    return data.results || data;
  }

  export async function getPayment(id: string): Promise<PaymentDto> {
    const { data } = await api.get(`/api/v1/payments/payments/${id}/`);
    return data;
  }

  export async function createPayment(payload: PaymentRequest): Promise<PaymentDto> {
    const { data } = await api.post('/api/v1/payments/payments/', payload);
    return data;
  }

  export async function updatePayment(id: string, payload: PatchedPaymentRequest): Promise<PaymentDto> {
    const { data } = await api.patch(`/api/v1/payments/payments/${id}/`, payload);
    return data;
  }

  export async function deletePayment(id: string): Promise<void> {
    await api.delete(`/api/v1/payments/payments/${id}/`);
  }

  export async function processRefund(id: string, payload: { amount: string; reason?: string }): Promise<PaymentDto> {
    const { data } = await api.post(`/api/v1/payments/payments/${id}/process_refund/`, payload);
    return data;
  }

  export interface RecordPaymentRequest {
    invoice: string;
    amount: string;
    payment_method?: 'MANUAL' | 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CHECK' | 'OTHER';
    notes?: string;
    payment_date?: string; // ISO 8601 format
  }

  export async function recordPayment(payload: RecordPaymentRequest): Promise<PaymentDto> {
    const { data } = await api.post('/api/v1/payments/payments/record_payment/', payload);
    return data;
  }

  // ============================================================================
  // Pricing API Functions
  // ============================================================================

  export async function getPricings(params?: {
    object_id?: string;
    is_active?: boolean;
    search?: string;
    ordering?: string;
    page?: number;
  }): Promise<PricingDto[]> {
    const { data } = await api.get('/api/v1/payments/pricings/', { params });
    return data.results || data;
  }

  export async function getPricing(id: string): Promise<PricingDto> {
    const { data } = await api.get(`/api/v1/payments/pricings/${id}/`);
    return data;
  }

  export async function createPricing(payload: PricingRequest): Promise<PricingDto> {
    const { data } = await api.post('/api/v1/payments/pricings/', payload);
    return data;
  }

  export async function updatePricing(id: string, payload: PatchedPricingRequest): Promise<PricingDto> {
    const { data } = await api.patch(`/api/v1/payments/pricings/${id}/`, payload);
    return data;
  }

  export async function deletePricing(id: string): Promise<void> {
      const primaryUrl = `/api/v1/payments/pricings/${id}/`;
      try {
        await api.delete(primaryUrl);
      } catch (error: any) {
        const status = error?.response?.status;
        // Some deployments expose singular route names (pricing) or underscore variants.
        if (status === 404) {
          await api.delete(`/api/v1/payments/pricing/${id}/`);
          return;
        }
        throw error;
      }
  }

