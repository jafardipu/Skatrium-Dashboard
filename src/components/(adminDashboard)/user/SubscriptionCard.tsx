"use client";

import {
  formatLocalDate,
  getSubscriptionLabel,
} from "@/utils/subscriptionHelpers";
import { ReactNode } from "react";

type Props = {
  user: any;
};

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-3 bg-[#21424617] py-2.5 px-2 border-b border-[#FFFFFF14]">
      <h4 className="text-gray-400 text-sm">{label}</h4>
      <div className="font-medium text-[#cad1d6] text-sm text-right">{value}</div>
    </div>
  );
}

export default function SubscriptionCard({ user }: Props) {
  const sub = user?.subscription;

  return (
    <div className="mt-4">
      <h2 className="font-semibold text-gray-300 mb-1 px-2">Subscription</h2>
      <Row
        label="Status"
        value={
          <span className="inline-flex items-center gap-2">
            {getSubscriptionLabel(sub?.status)}
            {sub?.billingIssue ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400">
                ⚠ Payment issue
              </span>
            ) : null}
          </span>
        }
      />
      <Row label="Plan" value={sub?.revenueCatPackageName || "—"} />
      <Row label="Start date" value={formatLocalDate(sub?.startsAt)} />
      <Row label="Expiry date" value={formatLocalDate(sub?.expiresAt)} />
      <Row
        label="Auto-renew"
        value={
          sub?.willRenew == null ? "—" : sub.willRenew ? "Yes" : "No"
        }
      />
      <Row
        label="Billing issue"
        value={sub?.billingIssue ? "Yes" : "No"}
      />
      <Row
        label="Environment"
        value={
          sub?.environment === "SANDBOX" ? (
            <span className="px-2 py-0.5 rounded text-xs bg-blue-500/15 text-blue-300">
              Test (Sandbox)
            </span>
          ) : (
            sub?.environment || "—"
          )
        }
      />
    </div>
  );
}
