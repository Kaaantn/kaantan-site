import { createClient } from "@/lib/supabase/server";
import PanelShell from "../PanelShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  return <PanelShell email={data.user?.email || ""}>{children}</PanelShell>;
}
