// Core entity types for the Inked Market platform

import type { StudioThemeConfig } from "@/lib/types/builder";
import type { StudioIntegrations } from "@/lib/types/integrations";

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  twitter?: string;
  website?: string;
}

export type StudioSource = "google" | "organic";

// ─── Cover photo framing ──────────────────────────────────────────────────────

/**
 * Crop rect normalized (0-1) against the ORIGINAL cover upload.
 * `ratio` is the aspect-preset id it was made with (restores the editor).
 */
export interface CoverCrop {
  x: number;
  y: number;
  w: number;
  h: number;
  ratio: string;
}

/** Focal point normalized (0-1) within the DISPLAYED cover — drives background-position. */
export interface CoverFocal {
  x: number;
  y: number;
}

export interface Studio extends BaseEntity {
  name: string;
  description: string;
  bio: string;
  location: Location;
  phone: string;
  email: string;
  socialLinks: SocialLinks;
  coverImage: string;
  /** Cover framing focal point — public renderers apply it via background-position. */
  coverFocal?: CoverFocal;
  /** Dedicated cover photos for multi-photo heroes (heroCoverMode "multi"). */
  coverImages?: string[];
  profileImage: string;
  images: string[];
  specialties: string[];
  rating: number;
  reviewCount: number;
  verified: boolean;
  artistIds: string[]; // IDs of artists working at this studio
  openHours?: {
    [key: string]: { open: string; close: string; closed?: boolean } | { closed: true };
  };
  /** Per-platform connection records — same shape the builder and dashboard persist. */
  integrations?: StudioIntegrations;
  // Seeding & claim fields (populated by Supabase, optional for backwards compat)
  slug?: string;
  source?: StudioSource;
  googlePlaceId?: string;
  claimedBy?: string;
  claimedAt?: Date;
  latitude?: number;
  longitude?: number;
  // Builder — saved studio website theme (persisted as theme_config jsonb)
  themeConfig?: StudioThemeConfig;
  /** Live site theme — set by Publish. Absent = no custom site is public yet. */
  publishedThemeConfig?: StudioThemeConfig;
  publishedAt?: Date;
}

export interface Artist extends BaseEntity {
  name: string;
  bio: string;
  profileImage: string;
  coverImage?: string;
  studioId?: string; // Optional - artist might be independent
  specialties: string[];
  styles: TattooStyle[];
  portfolioImages: PortfolioImage[];
  socialLinks: SocialLinks;
  rating: number;
  reviewCount: number;
  verified: boolean;
  yearsOfExperience: number;
  certifications?: string[];
  location?: { city: string; state: string };
}

export interface PortfolioImage {
  id: string;
  url: string;
  title?: string;
  description?: string;
  tags: string[];
  uploadedAt: Date;
}

export type TattooStyle =
  | 'traditional'
  | 'realism'
  | 'watercolor'
  | 'tribal'
  | 'geometric'
  | 'blackwork'
  | 'japanese'
  | 'minimalist'
  | 'portrait'
  | 'fine-line'
  | 'neo-traditional'
  | 'dotwork'
  | 'sketch'
  | 'abstract'
  | 'other';

export interface Customer extends BaseEntity {
  name: string;
  email: string;
  profileImage?: string;
  bio?: string;
  location?: Partial<Location>;
  savedStudioIds: string[];
  savedArtistIds: string[];
  savedDesignIds: string[];
  preferences?: {
    styles: TattooStyle[];
    priceRange?: { min: number; max: number };
    location?: string;
  };
}

export type ReviewSource = "inked-market" | "google" | "yelp" | "trustpilot";

export interface Review extends BaseEntity {
  authorId: string;
  authorName: string;
  authorImage?: string;
  targetId: string; // Studio or Artist ID
  targetType: 'studio' | 'artist';
  rating: number;
  title: string;
  content: string;
  images?: string[];
  verified: boolean; // Verified customer
  /** Where this review originated. Defaults to "inked-market" for local reviews. */
  source?: ReviewSource;
}

export interface Message extends BaseEntity {
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  attachments?: string[];
}

export interface Conversation extends BaseEntity {
  participantIds: string[];
  lastMessageAt: Date;
  lastMessage?: string;
  unreadCount: { [userId: string]: number };
}

// Filter and search types
export interface DiscoverFilters {
  searchQuery?: string;
  location?: string;
  styles?: TattooStyle[];
  specialties?: string[];
  rating?: number;
  verified?: boolean;
  type?: 'studios' | 'artists' | 'all';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
  };
}

// Component prop types
export interface CardProps {
  title: string;
  description: string;
  image: string;
  href: string;
  badge?: string;
  rating?: number;
  reviewCount?: number;
}

// Dashboard types
export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  skippedLabel?: string;
}

export interface DashboardStat {
  label: string;
  value: string | number;
  empty?: boolean;
}

export interface DashboardData {
  name: string;
  subtitle?: string;
  avatarUrl?: string;
  tags: string[];
  accentColor: "indigo" | "amber";
  stats: DashboardStat[];
  checklist: ChecklistItem[];
  onboardingTitle: string;
  onboardingSubtitle: string;
}

// Availability types
export interface TimeSlot {
  start: string;
  end: string;
}

export interface DayAvailability {
  enabled: boolean;
  slots: TimeSlot[];
}

export interface WeeklyAvailability {
  [day: string]: DayAvailability;
}

// Affiliation types
export type AffiliationStatus = "pending-invite" | "pending-request" | "active";

export interface Affiliation {
  /** Affiliation row id when backed by an affiliations row; artist id for linked entries. */
  id: string;
  name: string;
  avatarUrl?: string;
  status: AffiliationStatus;
  role: "artist" | "studio";
  styles?: string[];
  /** artists.id of the counterpart (set on live roster entries). */
  artistId?: string;
  /** Linked via artists.studio_id (artist-managed) — no affiliation row, studio can't remove. */
  linked?: boolean;
}

// Studio service flags (operational capabilities, not tattoo styles)
export type StudioService = "walk-ins" | "piercing";

// Dashboard quick action type
export interface QuickAction {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick?: () => void;
  iconBgClass?: string;
  iconBorderClass?: string;
}

// Settings types

export type TierSlug = "liner" | "shader" | "magnum";
export type BillingCycle = "monthly" | "annual";
export type BillingStatus = "active" | "cancelled" | "draft";

export interface NotificationPreferences {
  marketing: boolean;
  platformUpdates: boolean;
  // Artist
  bookingRequests?: boolean;
  studioInvitations?: boolean;
  // Studio
  artistApplications?: boolean;
  // Artist + Studio
  bookingAlerts?: boolean;
  reviewAlerts?: boolean;
  // Customer
  savedArtistUpdates?: boolean;
  bookingConfirmations?: boolean;
}

export interface PrivacyPreferences {
  showInSearch: boolean;
  allowMessages: boolean;
  // Artist
  showAvailability?: boolean;
  showAffiliation?: boolean;
  portfolioVisibility?: "public" | "followers";
  // Studio
  showBusinessHours?: boolean;
  showArtistRoster?: boolean;
  // Customer
  showSavedItems?: boolean;
  showReviewHistory?: boolean;
}

export interface BillingInfo {
  plan: TierSlug | null;
  cycle: BillingCycle;
  nextBillingDate?: string;
  cancelledAt?: string;
  status: BillingStatus;
}

export interface ConnectedAccount {
  handle?: string;
  email?: string;
  connectedAt: string;
}

export interface ConnectedAccounts {
  instagram?: ConnectedAccount;
  google?: ConnectedAccount;
  apple?: ConnectedAccount;
}

export interface SavedItemMeta {
  id: string;
  entityId: string;
  entityType: "studio" | "artist" | "design";
  savedAt: string;
}

// Customer dashboard types

export type AppointmentStatus = "confirmed" | "pending" | "completed" | "cancelled";

export interface Appointment extends BaseEntity {
  customerId: string;
  artistId: string;
  artistName: string;
  studioId?: string;
  studioName?: string;
  date: Date;
  duration: number;
  status: AppointmentStatus;
  designBriefId?: string;
  invoiceId?: string;
  notes?: string;
}

export type BookingRequestStatus = "pending" | "accepted" | "declined" | "expired" | "withdrawn";

export interface BookingRequest extends BaseEntity {
  customerId: string;
  artistId: string;
  artistName: string;
  studioId?: string;
  studioName?: string;
  requestedDate?: Date;
  flexibleDates?: boolean;
  designBriefId?: string;
  status: BookingRequestStatus;
  summary: string;
}

export type InvoiceStatus = "paid" | "unpaid" | "overdue" | "refunded";

export interface Invoice extends BaseEntity {
  customerId: string;
  artistId: string;
  artistName: string;
  appointmentId?: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  dueDate?: Date;
  paidAt?: Date;
  description: string;
}

export type DesignBriefStatus = "draft" | "submitted" | "in-review" | "accepted" | "declined";

export interface DesignBrief extends BaseEntity {
  customerId: string;
  artistId?: string;
  artistName?: string;
  placement: string;
  size: string;
  budget?: { min: number; max: number };
  description: string;
  referenceImages: string[];
  notes?: string;
  status: DesignBriefStatus;
}

export interface AftercareStep {
  id: string;
  day: number;
  title: string;
  instructions: string;
  completed: boolean;
  completedAt?: Date;
}

export interface AftercareTimeline extends BaseEntity {
  appointmentId: string;
  artistId: string;
  artistName: string;
  startDate: Date;
  steps: AftercareStep[];
  customNotes?: string;
}

export interface HealedPhoto extends BaseEntity {
  customerId: string;
  appointmentId: string;
  artistId: string;
  url: string;
  caption?: string;
  approvedForPortfolio: boolean;
}

export type CustomerDashboardTab = "activity" | "invoices" | "reviews" | "aftercare" | "briefs";

export interface ConversationParticipant {
  id: string;
  name: string;
  avatarUrl?: string;
  role: "artist" | "studio";
}

export type InkAccentColor = "sage" | "rust" | "red";
