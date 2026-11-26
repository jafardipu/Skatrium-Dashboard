import { TAdminProduct, TProductHost, TProductReview } from "@/types/product";

/** Active when isActive is true or missing */
export function isProductActive(product?: Pick<TAdminProduct, "isActive"> | null) {
  return product?.isActive !== false;
}

export function getSellerName(host?: TProductHost | string | null) {
  if (!host || typeof host === "string") return "N/A";
  return host.businessName || host.fullName || "N/A";
}

export function getHostImageUrl(host?: TProductHost | string | null) {
  if (!host || typeof host === "string") return undefined;
  if (typeof host.image === "string") return host.image;
  return host.image?.url;
}

export function getCategoryName(category?: TAdminProduct["category"]) {
  if (!category) return "N/A";
  if (typeof category === "string") return category;
  return category.name || "N/A";
}

export function getAverageRating(reviews?: TProductReview[]) {
  if (!reviews?.length) return { average: 0, count: 0 };
  const total = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
  return {
    average: total / reviews.length,
    count: reviews.length,
  };
}

export function formatMoney(
  amount?: number | null,
  currency = "USD",
) {
  if (amount == null || Number.isNaN(Number(amount))) return "N/A";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(Number(amount));
  } catch {
    return `$${Number(amount).toFixed(2)}`;
  }
}

export function getImageUrl(
  image?: string | { url?: string } | null,
) {
  if (!image) return undefined;
  if (typeof image === "string") return image;
  return image.url;
}
