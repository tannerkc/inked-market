// Core entity types for the Inked Market platform

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
  twitter?: string;
  website?: string;
}

export interface Shop extends BaseEntity {
  name: string;
  description: string;
  bio: string;
  location: Location;
  phone: string;
  email: string;
  socialLinks: SocialLinks;
  coverImage: string;
  profileImage: string;
  images: string[];
  specialties: string[];
  rating: number;
  reviewCount: number;
  verified: boolean;
  artistIds: string[]; // IDs of artists working at this shop
  openHours?: {
    [key: string]: { open: string; close: string; closed?: boolean };
  };
}

export interface Artist extends BaseEntity {
  name: string;
  bio: string;
  profileImage: string;
  coverImage?: string;
  shopId?: string; // Optional - artist might be independent
  specialties: string[];
  styles: TattooStyle[];
  portfolioImages: PortfolioImage[];
  socialLinks: SocialLinks;
  rating: number;
  reviewCount: number;
  verified: boolean;
  yearsOfExperience: number;
  certifications?: string[];
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
  savedShopIds: string[];
  savedArtistIds: string[];
  savedDesignIds: string[];
  preferences?: {
    styles: TattooStyle[];
    priceRange?: { min: number; max: number };
    location?: string;
  };
}

export interface Review extends BaseEntity {
  authorId: string;
  authorName: string;
  authorImage?: string;
  targetId: string; // Shop or Artist ID
  targetType: 'shop' | 'artist';
  rating: number;
  title: string;
  content: string;
  images?: string[];
  verified: boolean; // Verified customer
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
  type?: 'shops' | 'artists' | 'all';
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
