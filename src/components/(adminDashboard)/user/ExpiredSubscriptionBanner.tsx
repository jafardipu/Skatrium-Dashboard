"use client";

import { formatLocalDate } from "@/utils/subscriptionHelpers";

type Props = {
  user: any;
};

export default function ExpiredSubscriptionBanner({ user }: Props) {
  const isExpired =
    user?.accountStatus === "subscription_expired" || user?.subscriptionExpired;

  if (!isExpired) return null;

  const expiresAt = user?.subscription?.expiresAt;

  return (
    <div className="mb-3 rounded-lg border border-orange-500/40 bg-orange-500/10 px-3 py-2 text-sm text-orange-300">
      This account was deactivated because its subscription expired
      {expiresAt ? ` on ${formatLocalDate(expiresAt)}` : ""}.
    </div>
  );
}
