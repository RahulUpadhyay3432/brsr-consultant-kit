import { requireConsultant } from "@/lib/datarequest/guard";
import ProposalBuilder from "@/components/datarequest/ProposalBuilder";

// Pro tool — gated by the /requests middleware; requireConsultant() is
// defence-in-depth (redirects to /login if the passcode cookie is missing).
export const dynamic = "force-dynamic";

export default function ProposalPage() {
  requireConsultant();
  return <ProposalBuilder />;
}
