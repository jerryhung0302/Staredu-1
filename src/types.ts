export interface Course {
  id: string;
  type: 'physical' | 'online';
  title: string;
  category: string;
  price: number;
  description: string;
  image: string;
  tags: string[];
  stripePriceId?: string;
  location?: string;
  duration?: string;
  details?: string;
  startDate?: string;
  endDate?: string;
}

export interface BannerItem {
  image: string;
  linkUrl?: string;
}

export interface AppConfig {
  homeBanners: (string | BannerItem)[];
  physicalBanner: string;
  onlineBanner: string;
}
