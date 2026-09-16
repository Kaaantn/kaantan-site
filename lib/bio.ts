import { createAdminClient } from "@/lib/supabase/admin";

export interface BioSocialLink {
  platform: string;
  url: string;
  live?: boolean;
  followerCount?: string;
  clicks?: number;
}

export interface BioLink {
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  icon: string;
  iconImage?: string;
  color?: string;
  iconColor?: string;
  perk?: string;
  clicks?: number;
}

export interface BioConfig {
  bio?: string;
  socialLinks: BioSocialLink[];
  displayName?: string;
  phone?: string;
  showPhone?: boolean;
  location?: string;
  bannerColor?: string;
  avatar?: string;
  links: BioLink[];
  email?: string;
  showEmail?: boolean;
}

const DEFAULT_BIO: BioConfig = {
  socialLinks: [],
  links: [],
};

export async function getBioConfig(): Promise<BioConfig> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("bio_config").select("data").eq("id", 1).maybeSingle();
  return (data?.data as BioConfig) || DEFAULT_BIO;
}

export async function saveBioConfig(config: BioConfig): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("bio_config")
    .upsert({ id: 1, data: config, updated_at: new Date().toISOString() });
  if (error) throw error;
}
