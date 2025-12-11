import api from '@/api/client';

// Organization types
export interface OrganizationDto {
  id: string;
  name: string;
  domain?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'TRIAL' | 'SUSPENDED';
  created_at: string;
  updated_at: string;
}

// Subscription Plan types
export interface SubscriptionPlanDto {
  id: string;
  name: string;
  description: string;
  price_minor: number;
  currency: string;
  billing_period: 'MONTHLY' | 'YEARLY';
  is_active: boolean;
  features: string[];
  created_at: string;
  updated_at: string;
}

// Subscription types
export interface SubscriptionDto {
  id: string;
  organization: string;
  plan: string;
  status: 'TRIAL' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  started_at: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

// Feature Status types
export interface FeatureStatusDto {
  organization_id: string;
  has_subscription: boolean;
  is_active: boolean;
  status: string;
  plan_name: string | null;
  enabled_modules: string[];
  all_modules: string[];
}

// Organizations
export async function getOrganizations(): Promise<OrganizationDto[]> {
  const { data } = await api.get('/api/v1/subscriptions/organizations/');
  return data.results || data;
}

export async function getOrganization(id: string): Promise<OrganizationDto> {
  const { data } = await api.get(`/api/v1/subscriptions/organizations/${id}/`);
  return data;
}

export async function createOrganization(payload: Partial<OrganizationDto>): Promise<OrganizationDto> {
  const { data } = await api.post('/api/v1/subscriptions/organizations/', payload);
  return data;
}

export async function updateOrganization(id: string, payload: Partial<OrganizationDto>): Promise<OrganizationDto> {
  const { data } = await api.patch(`/api/v1/subscriptions/organizations/${id}/`, payload);
  return data;
}

export async function deleteOrganization(id: string): Promise<void> {
  await api.delete(`/api/v1/subscriptions/organizations/${id}/`);
}

export async function getOrganizationSubscriptionStatus(organizationId: string): Promise<FeatureStatusDto> {
  const { data } = await api.get(`/api/v1/subscriptions/organizations/${organizationId}/subscription_status/`);
  return data;
}

// Subscription Plans
export async function getSubscriptionPlans(): Promise<SubscriptionPlanDto[]> {
  const { data } = await api.get('/api/v1/subscriptions/plans/');
  return data.results || data;
}

export async function getSubscriptionPlan(id: string): Promise<SubscriptionPlanDto> {
  const { data } = await api.get(`/api/v1/subscriptions/plans/${id}/`);
  return data;
}

export async function getAvailablePlans(): Promise<SubscriptionPlanDto[]> {
  const { data } = await api.get('/api/v1/subscriptions/plans/available/');
  return data;
}

export async function createSubscriptionPlan(payload: Partial<SubscriptionPlanDto>): Promise<SubscriptionPlanDto> {
  const { data } = await api.post('/api/v1/subscriptions/plans/', payload);
  return data;
}

export async function updateSubscriptionPlan(id: string, payload: Partial<SubscriptionPlanDto>): Promise<SubscriptionPlanDto> {
  const { data } = await api.patch(`/api/v1/subscriptions/plans/${id}/`, payload);
  return data;
}

export async function deleteSubscriptionPlan(id: string): Promise<void> {
  await api.delete(`/api/v1/subscriptions/plans/${id}/`);
}

// Subscriptions
export async function getSubscriptions(organizationId?: string, status?: string): Promise<SubscriptionDto[]> {
  const params: Record<string, string> = {};
  if (organizationId) params.organization = organizationId;
  if (status) params.status = status;
  const { data } = await api.get('/api/v1/subscriptions/subscriptions/', { params });
  return data.results || data;
}

export async function getSubscription(id: string): Promise<SubscriptionDto> {
  const { data } = await api.get(`/api/v1/subscriptions/subscriptions/${id}/`);
  return data;
}

export async function createSubscription(payload: Partial<SubscriptionDto>): Promise<SubscriptionDto> {
  const { data } = await api.post('/api/v1/subscriptions/subscriptions/', payload);
  return data;
}

export async function updateSubscription(id: string, payload: Partial<SubscriptionDto>): Promise<SubscriptionDto> {
  const { data } = await api.patch(`/api/v1/subscriptions/subscriptions/${id}/`, payload);
  return data;
}

export async function deleteSubscription(id: string): Promise<void> {
  await api.delete(`/api/v1/subscriptions/subscriptions/${id}/`);
}

export async function getMySubscription(): Promise<SubscriptionDto> {
  const { data } = await api.get('/api/v1/subscriptions/subscriptions/my/');
  return data;
}

export async function createNewSubscription(payload: {
  plan_id: string;
  organization_id?: string;
}): Promise<SubscriptionDto> {
  const { data } = await api.post('/api/v1/subscriptions/subscriptions/create_subscription/', payload);
  return data;
}

// Feature Status
export async function getFeatureStatus(): Promise<FeatureStatusDto> {
  const { data } = await api.get('/api/v1/subscriptions/features/status/');
  return data;
}

