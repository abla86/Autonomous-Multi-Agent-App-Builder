export type SubscriptionCategory =
  | 'streaming'
  | 'music'
  | 'software'
  | 'fitness'
  | 'news'
  | 'cloud'
  | 'telecom'
  | 'gaming'
  | 'utility'
  | 'other';

export type SubscriptionSource =
  | 'apple_app_store'
  | 'google_play'
  | 'bank_direct_debit'
  | 'card_charge'
  | 'vipps'
  | 'klarna'
  | 'email_invoice'
  | 'paypal'
  | 'manual';

export type SubscriptionStatus =
  | 'keep' // Brukeren har valgt å beholde
  | 'to_cancel' // Merket for oppsigelse
  | 'cancelled' // Fullført oppsagt / sendt
  | 'force_blocked'; // Tvangsstoppet via bank/kort

export interface Subscription {
  id: string;
  name: string;
  category: SubscriptionCategory;
  price: number; // Månedspris eller terminpris i NOK
  billingCycle: 'monthly' | 'yearly' | 'weekly' | 'quarterly';
  source: SubscriptionSource;
  status: SubscriptionStatus;
  nextRenewalDate: string; // YYYY-MM-DD
  customerReference?: string; // Bruker-ID, e-post eller avtalegiro-nr
  cancellationUrl?: string; // Direkte lenke til oppsigelsesside
  supportEmail?: string;
  supportPhone?: string;
  cancellationNoticeDays: number;
  notes?: string;
  forcedNoticeSentAt?: string;
  forcedNoticeLetter?: string;
  bankBlockRequestedAt?: string;
  dateDiscovered: string;
}

export interface UserContactProfile {
  fullName: string;
  email: string;
  phone: string;
  address?: string;
}
