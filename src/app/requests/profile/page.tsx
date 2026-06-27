import { requireConsultant } from "@/lib/datarequest/guard";
import ProfilePanel from "@/components/datarequest/ProfilePanel";

export const dynamic = "force-dynamic";

export default function ProfilePage() {
  requireConsultant(); // defence-in-depth on top of the /requests middleware
  return <ProfilePanel />;
}
