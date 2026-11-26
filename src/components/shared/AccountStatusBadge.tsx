"use client";

import {
  ACCOUNT_STATUS_CONFIG,
  getAccountStatus,
  TAccountStatus,
} from "@/utils/subscriptionHelpers";
import { cn } from "@/lib/utils";

type Props = {
  user: any;
  className?: string;
};

export default function AccountStatusBadge({ user, className }: Props) {
  const status = getAccountStatus(user);
  const config =
    ACCOUNT_STATUS_CONFIG[status] ||
    ACCOUNT_STATUS_CONFIG.active;

  return (
    <span
      className={cn(
        "inline-flex px-2 py-1 rounded text-xs font-medium whitespace-nowrap",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}

export function accountStatusLabel(status: TAccountStatus) {
  return ACCOUNT_STATUS_CONFIG[status]?.label || status;
}
