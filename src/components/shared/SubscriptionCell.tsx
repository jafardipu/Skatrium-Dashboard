"use client";

import {
  getSubscriptionDateLine,
  getSubscriptionLabel,
} from "@/utils/subscriptionHelpers";

type Props = {
  user: any;
};

export default function SubscriptionCell({ user }: Props) {
  const status = user?.subscription?.status;
  if (!status || status === "none") {
    return <span className="text-gray-500">—</span>;
  }

  const dateLine = getSubscriptionDateLine(user);

  return (
    <div className="min-w-[140px]">
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[#cad1d6] font-medium">
          {getSubscriptionLabel(status)}
        </span>
        {user?.subscription?.billingIssue && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400">
            ⚠ Payment issue
          </span>
        )}
      </div>
      {dateLine && (
        <p className="text-xs text-gray-500 mt-0.5">{dateLine}</p>
      )}
    </div>
  );
}
