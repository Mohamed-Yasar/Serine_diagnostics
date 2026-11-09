/**
 * Booking Provider Configuration & Abstraction
 * 
 * Architecture:
 * - Production: Handoff to an approved third-party healthcare scheduling provider
 * - Local Development / Preview: Safe demo/prototype mode (no real PHI stored/sent)
 */

export interface BookingProviderConfig {
  providerUrl: string | null;
  isExternalProviderConfigured: boolean;
  providerName: string;
  mode: 'local_demo' | 'external_provider';
}

export function getBookingConfig(): BookingProviderConfig {
  // Check for environment variable safely
  const metaEnv = (import.meta as unknown as { env?: Record<string, string> })?.env;
  const rawUrl = metaEnv?.VITE_BOOKING_PROVIDER_URL || '';
  const providerUrl = rawUrl && rawUrl.trim().length > 0 ? rawUrl.trim() : null;

  return {
    providerUrl,
    isExternalProviderConfigured: Boolean(providerUrl),
    providerName: 'Secure Healthcare Booking Service',
    mode: providerUrl ? 'external_provider' : 'local_demo'
  };
}
