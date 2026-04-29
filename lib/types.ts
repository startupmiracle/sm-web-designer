export interface Prospect {
  id: string;
  business_name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  category: string | null;
  rating: number | null;
  review_count: number | null;
  has_website: boolean;
  reviews_data: ReviewData[] | null;
  business_status: string | null;
  newest_review_months: number | null;
  contact_name: string | null;
  google_place_id: string | null;
}

export interface ReviewData {
  rating?: number;
  text?: {
    text?: string;
  };
  authorAttribution?: {
    displayName?: string;
  };
}

export interface IndustryTemplate {
  id: string;
  name: string;
  category: string;
  heroImageStyle: string;
  colorAccent: string;
  defaultServices: string[];
  taglineExamples: string[];
  reviewKeywordPriorities: string[];
  promptInstructions: string;
}

export type GeneratedSiteStatus =
  | "queued"
  | "generating"
  | "review"
  | "ready_to_pitch"
  | "pitched"
  | "sold";

export interface GeneratedSite {
  id: string;
  prospect_id: string | null;
  slug: string;
  url: string | null;
  status: GeneratedSiteStatus;
  deal_amount: number | null;
  created_at: string;
  business_name?: string | null;
  category?: string | null;
  city?: string | null;
  thumbnail?: string | null;
}

export interface AgentSettings {
  systemPrompt: string;
  skills: Record<string, boolean>;
  activeModel: "ollama" | "openai";
}
