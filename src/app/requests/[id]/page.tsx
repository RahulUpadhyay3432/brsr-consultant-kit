import { notFound } from "next/navigation";
import { getCampaign, listCompanyContacts } from "@/lib/datarequest/db";
import { campaignEmissions, emissionInputs, GHG_METHODOLOGY } from "@/lib/datarequest/emissions";
import { buildAssuranceLedger, assuranceStats } from "@/lib/datarequest/assurance";
import { exportFilename } from "@/lib/export";
import { signCampaignEvidence } from "@/lib/datarequest/storage";
import CampaignWorkspace from "@/components/datarequest/CampaignWorkspace";
import BulkImportPanel from "@/components/datarequest/BulkImportPanel";
import {
  addContactAction,
  addDirectoryContactsAction,
  deleteDirectoryContactAction,
  importDocumentAction,
  applyImportAction,
  remindAllPendingAction,
  bulkImportAction,
  applyBulkImportAction,
} from "@/lib/datarequest/actions";
import { REQUEST_FIELDS } from "@/lib/datarequest/fields";

export const dynamic = "force-dynamic";

export default async function CampaignDetailPage({
  params, searchParams,
}: { params: { id: string }; searchParams: { error?: string } }) {
  const [campaign, directory] = await Promise.all([
    getCampaign(params.id),
    listCompanyContacts(params.id), // best-effort → [] before the migration
  ]);
  if (!campaign) notFound();

  const base = process.env.APP_BASE_URL || "http://localhost:3000";
  const allItems = campaign.contacts.flatMap((c) => c.items);

  // Sign evidence URLs on the server, then flatten the Map → a plain record so it
  // crosses the server/client boundary to the workspace.
  const signed = await signCampaignEvidence(allItems);
  const evidenceUrls: Record<string, string> = {};
  signed.forEach((url, id) => { if (url) evidenceUrls[id] = url; });

  const ghg = campaignEmissions(campaign);
  const inputs = emissionInputs(campaign);
  const assurance = assuranceStats(campaign);
  const ledger = buildAssuranceLedger(campaign);
  const ledgerFilename = exportFilename("brsr-assurance-ledger", campaign.clientName);

  const daysToDeadline = campaign.deadline
    ? Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / 86_400_000)
    : null;

  // Bind the server actions to this campaign (defence-in-depth + ergonomic props).
  const addOwner = addContactAction.bind(null, campaign.id, campaign.clientName, campaign.deadline, campaign.reportingPeriod);
  const addContact = addDirectoryContactsAction.bind(null, campaign.id);
  const deleteContact = deleteDirectoryContactAction.bind(null, campaign.id);
  const importDoc = importDocumentAction.bind(null, campaign.id);
  const applyImport = applyImportAction.bind(null, campaign.id);
  const remindAll = remindAllPendingAction.bind(null, campaign.id);

  return (
    <div className="max-w-[1600px] mx-auto bg-page">
      <a href="/requests" className="text-[14.5px] text-ink-body hover:text-ink">← All collections</a>

      {/* Headline "bring your documents" surface — bulk import across the campaign. */}
      <div className="mt-4">
        <BulkImportPanel
          campaignId={campaign.id}
          bulkAction={bulkImportAction}
          applyAction={applyBulkImportAction}
        />
      </div>

      <div className="mt-5">
        <CampaignWorkspace
          campaign={campaign}
          base={base}
          evidenceUrls={evidenceUrls}
          ghg={ghg ? { scope1_tco2e: ghg.scope1_tco2e, scope2_tco2e: ghg.scope2_tco2e, total_tco2e: ghg.total_tco2e } : null}
          inputs={inputs}
          methodology={GHG_METHODOLOGY}
          assurance={assurance}
          ledger={ledger}
          ledgerFilename={ledgerFilename}
          daysToDeadline={daysToDeadline}
          directory={directory}
          fields={REQUEST_FIELDS}
          addOwnerError={searchParams.error === "owner"}
          addOwnerAction={addOwner}
          addContactAction={addContact}
          deleteContactAction={deleteContact}
          importAction={importDoc}
          applyImportAction={applyImport}
          remindAllPendingAction={remindAll}
        />
      </div>
    </div>
  );
}
