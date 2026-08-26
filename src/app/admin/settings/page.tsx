import { updateSetting } from "@/app/admin/actions";
import { AdminHeader } from "@/components/admin/admin-shell";
import { adminClient } from "@/lib/services/admin-data";
export default async function Page() {
  const db = await adminClient();
  const [{ data: settings }, { data: history }] = await Promise.all([
    db.from("business_settings").select("*"),
    db
      .from("business_setting_versions")
      .select("*")
      .order("effective_at", { ascending: false })
      .limit(10),
  ]);
  const finance = (settings?.find((x) => x.key === "finance_policy")?.value ??
      {}) as Record<string, number>,
    ops = (settings?.find((x) => x.key === "verification_policy")?.value ??
      {}) as Record<string, number | boolean>;
  return (
    <>
      <AdminHeader
        eyebrow="Configuration"
        title="Platform settings"
        description="Financial changes are versioned; existing campaign snapshots remain unchanged."
      />
      <div className="mt-7 grid gap-5 xl:grid-cols-2">
        <form
          action={updateSetting}
          className="grid gap-3 rounded-3xl bg-card p-6"
        >
          <input type="hidden" name="key" value="finance_policy" />
          <h2 className="text-2xl text-plum">Campaigns & Wallets</h2>
          <Field
            name="minimumBudget"
            label="Minimum campaign budget"
            value={finance.minimum_campaign_budget}
          />
          <Field
            name="commissionBps"
            label="Platform commission (basis points)"
            value={finance.platform_commission_bps}
          />
          <Field
            name="minimumPayout"
            label="Minimum withdrawal"
            value={finance.minimum_payout}
          />
          <Field
            name="settlementHours"
            label="Settlement review hours"
            value={finance.settlement_review_hours}
          />
          <Field
            name="budgetLowBps"
            label="Budget-low threshold (basis points)"
            value={finance.budget_low_threshold_bps}
          />
          <input
            required
            name="reason"
            placeholder="Reason for change"
            className="h-11 rounded-xl border px-3"
          />
          <button className="rounded-xl bg-coral p-3 text-white">
            Save versioned settings
          </button>
        </form>
        <form
          action={updateSetting}
          className="grid gap-3 rounded-3xl bg-card p-6"
        >
          <input type="hidden" name="key" value="verification_policy" />
          <h2 className="text-2xl text-plum">Campaign Activity</h2>
          <Field
            name="reward"
            label="Participant reward KES"
            value={ops.participant_reward_kes}
          />
          <Field
            name="playbackPercentage"
            label="Minimum playback percentage"
            value={ops.minimum_playback_percentage}
          />
          <Field
            name="minimumSeconds"
            label="Minimum absolute playback seconds"
            value={ops.minimum_absolute_seconds}
          />
          <Field
            name="cooldown"
            label="Cooldown minutes"
            value={ops.cooldown_minutes}
          />
          <Field
            name="dailyLimit"
            label="Daily play limit"
            value={ops.participant_daily_limit}
          />
          <label className="text-sm">
            <input
              name="maintenance"
              type="checkbox"
              defaultChecked={Boolean(ops.maintenance_mode)}
            />{" "}
            Temporarily disable Sauti Player qualification
          </label>
          <input
            required
            name="reason"
            placeholder="Reason for change"
            className="h-11 rounded-xl border px-3"
          />
          <button className="rounded-xl bg-plum p-3 text-white">
            Save versioned settings
          </button>
        </form>
      </div>
      <section className="mt-8 rounded-3xl bg-card p-6">
        <h2 className="text-2xl text-plum">Recent versions</h2>
        {(history ?? []).map((x) => (
          <p key={x.id} className="border-b py-3 text-sm">
            {x.setting_key} · {x.reason} ·{" "}
            {new Date(x.effective_at).toLocaleString()}
          </p>
        ))}
      </section>
    </>
  );
}
function Field({
  name,
  label,
  value,
}: {
  name: string;
  label: string;
  value: number | boolean | undefined;
}) {
  return (
    <label className="grid gap-1 text-sm">
      {label}
      <input
        required
        name={name}
        type="number"
        defaultValue={String(value ?? 0)}
        className="h-11 rounded-xl border px-3"
      />
    </label>
  );
}
