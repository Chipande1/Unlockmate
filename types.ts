
export enum RequestStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  REQUESTED = 'REQUESTED', // User requested, waiting for admin
  PAYMENT_REQUIRED = 'PAYMENT_REQUIRED', // Admin uploaded, user needs to pay
  PENDING_UNLOCK = 'PENDING_UNLOCK', // Legacy/Unused in new flow
  READY = 'READY',
  FAILED = 'FAILED'
}

export enum UnlockType {
  SINGLE = 'SINGLE',
  LIFETIME = 'LIFETIME'
}

export interface DocumentMetadata {
  title: string;
  platform: string;
  subject: string;
  summary: string;
}

export interface UnlockRequest {
  id: string;
  url: string;
  email?: string; // Added for notifications
  status: RequestStatus;
  metadata?: DocumentMetadata;
  createdAt: number;
  unlockedUrl?: string; // Mocked download link
  unlockType?: UnlockType;
}

export interface PricingOption {
  id: UnlockType;
  title: string;
  price: number;
  description: string;
  features: string[];
  recommended?: boolean;
}

export type ViewState = 'home' | 'requests' | 'pricing' | 'how-it-works' | 'faq' | 'admin';
