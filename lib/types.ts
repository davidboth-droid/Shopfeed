export interface Product {
  id: string;
  title: string;
  description: string;
  link: string;
  imageLink: string;
  price: string;
  brand?: string;
  gtin?: string;
  mpn?: string;
  condition: 'new' | 'refurbished' | 'used';
  availability: 'in stock' | 'out of stock' | 'preorder' | 'backorder';
}

export interface SiteConfig {
  id: string;
  url: string;
  name: string;
  frequency: 'daily' | 'hourly' | 'weekly';
  updateTime: string; // HH:mm
  lastCrawl?: string;
  status: 'idle' | 'running' | 'failed' | 'success';
  error?: string;
  productCount?: number;
  improveImages?: boolean;
  improveTexts?: boolean;
  customSitemaps?: string[];
}

export interface CrawlResult {
  products: Product[];
  crawlTime: string;
}
