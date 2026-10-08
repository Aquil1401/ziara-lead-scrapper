export interface Lead {
  title: string;
  rating: string;
  reviews: string;
  category: string;
  phone: string;
  website: string;
  address: string;
  mapsUrl: string;
  email?: string;
  socials?: SocialHandles;
}

export interface SocialHandles {
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
}

export interface ScraperOptions {
  query: string;
  limit: number;
  headless: boolean;
  concurrency: number;
  enrich: boolean;
}

export type ProgressCallback = (message: string, count: number) => void;
