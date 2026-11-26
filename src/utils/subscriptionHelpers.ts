import moment from "moment";

export type TAccountStatus =
  | "active"
  | "subscription_expired"
  | "blocked"
  | "deletion_scheduled"
  | "deleted";

export type TSubscriptionStatus =
  | "active"
  | "trialing"
  | "expired"
  | "cancelled"
  | "none";

export type TUserSubscription = {
  status?: TSubscriptionStatus | string | null;
  startsAt?: string | null;
  expiresAt?: string | null;
  willRenew?: boolean | null;
  billingIssue?: boolean | null;
  revenueCatPackageName?: string | null;
  environment?: "PRODUCTION" | "SANDBOX" | string | null;
};

export const ACCOUNT_STATUS_CONFIG: Record<
  TAccountStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className: "bg-green-500/15 text-[#4BB54B]",
  },
  subscription_expired: {
    label: "Subscription expired",
    className: "bg-orange-500/15 text-orange-400",
  },
  blocked: {
    label: "Blocked",
    className: "bg-red-500/15 text-[#ee0808]",
  },
  deletion_scheduled: {
    label: "Deletion scheduled",
    className: "bg-gray-500/20 text-gray-400",
  },
  deleted: {
    label: "Deleted",
    className: "bg-gray-500/20 text-gray-400",
  },
};

export const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  active: "Active",
  trialing: "Trial",
  expired: "Expired",
  cancelled: "Cancelled",
  none: "No subscription",
};

export function formatLocalDate(value?: string | null) {
  if (!value) return "—";
  return moment(value).format("DD MMM YYYY");
}

export function getAccountStatus(user: any): TAccountStatus {
  if (user?.accountStatus && ACCOUNT_STATUS_CONFIG[user.accountStatus as TAccountStatus]) {
    return user.accountStatus as TAccountStatus;
  }
  if (user?.subscriptionExpired || user?.subscription?.status === "expired") {
    return "subscription_expired";
  }
  if (user?.isActive === false) return "blocked";
  return "active";
}

export function getSubscriptionLabel(status?: string | null) {
  if (!status) return "—";
  return SUBSCRIPTION_STATUS_LABELS[status] || status;
}

export function getSubscriptionDateLine(user: any): string | null {
  const sub = user?.subscription as TUserSubscription | undefined;
  if (!sub || sub.status === "none" || !sub.status) return null;

  if (user?.subscriptionExpired || sub.status === "expired") {
    return sub.expiresAt
      ? `Expired on ${formatLocalDate(sub.expiresAt)}`
      : "Expired";
  }

  if (sub.status === "active" && sub.willRenew && sub.expiresAt) {
    return `Renews on ${formatLocalDate(sub.expiresAt)}`;
  }

  if (sub.expiresAt) {
    return `Ends on ${formatLocalDate(sub.expiresAt)}`;
  }

  return null;
}

export function extractUsersList(usersData: any) {
  const payload = usersData?.data;
  const users = payload?.users || payload?.data || payload?.result || payload || [];
  const pagination = payload?.pagination || usersData?.meta || {};
  return {
    users: Array.isArray(users) ? users : [],
    total: pagination?.total ?? usersData?.meta?.total ?? 0,
  };
}
