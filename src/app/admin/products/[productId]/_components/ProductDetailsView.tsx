"use client";

import ProductDeleteButton from "@/app/admin/products/_components/ProductDeleteButton";
import ProductStatusToggle from "@/app/admin/products/_components/ProductStatusToggle";
import UserDetails from "@/components/(adminDashboard)/user/UserDetails";
import { cn } from "@/lib/utils";
import { useGetAdminProductDetailsQuery } from "@/redux/api/productApi";
import { useGetUsersDetailsQuery } from "@/redux/api/userApi";
import { TAdminProduct, TProductHost } from "@/types/product";
import {
  formatMoney,
  getAverageRating,
  getCategoryName,
  getHostImageUrl,
  getImageUrl,
  getSellerName,
  isProductActive,
} from "@/utils/productHelpers";
import { Image, Spin } from "antd";
import { ArrowLeft } from "lucide-react";
import moment from "moment";
import Link from "next/link";
import { ReactNode, useState } from "react";

type Props = {
  productId: string;
};

export default function ProductDetailsView({ productId }: Props) {
  const { data, isLoading, isError, error, refetch } =
    useGetAdminProductDetailsQuery(productId);
  const product = (data?.data || data) as TAdminProduct | undefined;

  const [sellerModalOpen, setSellerModalOpen] = useState(false);
  const [selectedSellerId, setSelectedSellerId] = useState<string | undefined>();

  const { data: sellerData } = useGetUsersDetailsQuery(selectedSellerId!, {
    skip: !selectedSellerId,
  });

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  const is404 =
    isError &&
    ((error as any)?.status === 404 ||
      (error as any)?.originalStatus === 404);

  if (!product?._id || is404) {
    return (
      <div className="border border-[#FFFFFF33]/[0.2] rounded-xl p-6 text-center">
        <p className="text-gray-300 mb-4">Product not found.</p>
        <Link href="/admin/products" className="text-[#78C0A8] underline">
          Back to products
        </Link>
      </div>
    );
  }

  const active = isProductActive(product);
  const host =
    product.host && typeof product.host !== "string"
      ? (product.host as TProductHost)
      : undefined;

  const { average, count } = getAverageRating(product.reviews);
  const currency = product.currency || "USD";
  const hasDiscount =
    (product.discount || 0) > 0 && product.discountPrice != null;

  const openSeller = () => {
    if (!host?._id) return;
    setSelectedSellerId(host._id);
    setSellerModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-[#cad1d6] hover:text-white"
        >
          <ArrowLeft size={18} />
          Back to products
        </Link>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "px-2 py-1 rounded text-xs font-medium",
              active
                ? "bg-green-500/15 text-[#4BB54B]"
                : "bg-gray-500/20 text-gray-400",
            )}
          >
            {active ? "Active" : "Inactive"}
          </span>
          <ProductStatusToggle
            product={product}
            onUpdated={() => {
              refetch();
            }}
          />
          <ProductDeleteButton product={product} redirectOnSuccess />
        </div>
      </div>

      <div className="border border-[#FFFFFF33]/[0.2] rounded-xl p-4 md:p-6 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-semibold text-[#cad1d6]">
                {product.name}
              </h1>
              <span
                className={cn(
                  "px-2 py-1 rounded text-xs font-medium",
                  active
                    ? "bg-green-500/15 text-[#4BB54B]"
                    : "bg-gray-500/20 text-gray-400",
                )}
              >
                {active ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-sm text-gray-400">
              {getCategoryName(product.category)} · Created{" "}
              {product.createdAt
                ? moment(product.createdAt).format("LL")
                : "N/A"}
            </p>
          </div>
          <div className="text-right">
            {hasDiscount ? (
              <>
                <p className="text-2xl font-bold text-[#cad1d6]">
                  {formatMoney(product.discountPrice, currency)}
                </p>
                <p className="text-sm text-gray-500 line-through">
                  {formatMoney(product.price, currency)}
                </p>
                <p className="text-xs text-amber-400">
                  {product.discount}% off
                </p>
              </>
            ) : (
              <p className="text-2xl font-bold text-[#cad1d6]">
                {formatMoney(product.price, currency)}
              </p>
            )}
          </div>
        </div>

        {/* Gallery */}
        <div>
          <h3 className="text-lg font-semibold text-[#cad1d6] mb-3">Images</h3>
          {product.images?.length ? (
            <Image.PreviewGroup>
              <div className="flex flex-wrap gap-3">
                {product.images.map((img, index) => (
                  <Image
                    key={img.id || img._id || index}
                    src={img.url}
                    alt={`${product.name}-${index + 1}`}
                    width={140}
                    height={140}
                    className="rounded-lg object-cover !w-[140px] !h-[140px]"
                  />
                ))}
              </div>
            </Image.PreviewGroup>
          ) : (
            <p className="text-gray-500 text-sm">No images</p>
          )}
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <DetailRow label="Stock" value={
            product.stock === 0 ? (
              <span className="text-[#ee0808]">Out of stock</span>
            ) : (
              String(product.stock ?? "N/A")
            )
          } />
          <DetailRow
            label="Shipping"
            value={formatMoney(product.shippingCost, currency)}
          />
          <DetailRow label="Material" value={product.material || "N/A"} />
          <DetailRow
            label="Colors"
            value={product.colors?.length ? product.colors.join(", ") : "N/A"}
          />
          <DetailRow
            label="Sizes"
            value={product.sizes?.length ? product.sizes.join(", ") : "N/A"}
          />
          <DetailRow
            label="Rating"
            value={
              count
                ? `${average.toFixed(1)} ★ (${count} reviews)`
                : "No reviews"
            }
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-[#cad1d6] mb-2">
            Description
          </h3>
          <p className="text-sm text-gray-300 whitespace-pre-wrap">
            {product.description || "N/A"}
          </p>
        </div>

        {/* Seller card */}
        <div>
          <h3 className="text-lg font-semibold text-[#cad1d6] mb-3">
            Seller
          </h3>
          <button
            type="button"
            onClick={openSeller}
            disabled={!host?._id}
            className="w-full md:w-auto text-left flex items-center gap-3 bg-[#21424617] border border-[#FFFFFF22] rounded-xl p-3 hover:border-[#78C0A8]/50 transition-colors disabled:opacity-60"
          >
            {getHostImageUrl(host) ? (
              <Image
                src={getHostImageUrl(host)}
                alt={getSellerName(host)}
                width={48}
                height={48}
                preview={false}
                className="rounded-full object-cover !w-12 !h-12"
              />
            ) : (
              <div className="size-12 rounded-full bg-[#312912] flex items-center justify-center text-white font-semibold">
                {getSellerName(host).charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-semibold text-[#cad1d6]">
                {getSellerName(host)}
              </p>
              <p className="text-xs text-gray-400">{host?.email || "N/A"}</p>
              {host?.phoneNumber && (
                <p className="text-xs text-gray-500">{host.phoneNumber}</p>
              )}
              <p className="text-xs text-[#78C0A8] mt-1">View seller profile</p>
            </div>
          </button>
        </div>

        {/* Reviews */}
        <div>
          <h3 className="text-lg font-semibold text-[#cad1d6] mb-3">
            Reviews ({product.reviews?.length || 0})
          </h3>
          {!product.reviews?.length ? (
            <p className="text-sm text-gray-500">No reviews yet.</p>
          ) : (
            <div className="space-y-3">
              {product.reviews.map((review) => {
                const reviewerName = review.isAnonymous
                  ? "Anonymous"
                  : review.user?.fullName || "User";
                const reviewerImage = getImageUrl(review.user?.image);

                return (
                  <div
                    key={review._id}
                    className="border border-[#FFFFFF22] rounded-xl p-3 bg-[#21424617]"
                  >
                    <div className="flex items-start gap-3">
                      {reviewerImage && !review.isAnonymous ? (
                        <Image
                          src={reviewerImage}
                          alt={reviewerName}
                          width={40}
                          height={40}
                          preview={false}
                          className="rounded-full object-cover !w-10 !h-10"
                        />
                      ) : (
                        <div className="size-10 rounded-full bg-[#312912] flex items-center justify-center text-white text-sm font-semibold">
                          {reviewerName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-medium text-[#cad1d6]">
                            {reviewerName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {review.createdAt
                              ? moment(review.createdAt).format("LL")
                              : ""}
                          </p>
                        </div>
                        <p className="text-amber-400 text-sm my-1">
                          {"★".repeat(Math.round(review.rating || 0))}
                          <span className="text-gray-500">
                            {"★".repeat(
                              Math.max(0, 5 - Math.round(review.rating || 0)),
                            )}
                          </span>
                        </p>
                        <p className="text-sm text-gray-300">
                          {review.comment || ""}
                        </p>

                        {!!review.images?.length && (
                          <Image.PreviewGroup>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {review.images.map((img, idx) => (
                                <Image
                                  key={img.id || img._id || idx}
                                  src={img.url}
                                  alt={`review-${idx}`}
                                  width={64}
                                  height={64}
                                  className="rounded object-cover !w-16 !h-16"
                                />
                              ))}
                            </div>
                          </Image.PreviewGroup>
                        )}

                        {!!review.replies?.length && (
                          <div className="mt-3 ml-2 pl-3 border-l border-[#FFFFFF33] space-y-2">
                            {review.replies.map((reply, idx) => (
                              <div key={idx}>
                                <p className="text-xs text-gray-400">
                                  {typeof reply.user === "string"
                                    ? "Reply"
                                    : reply.user?.fullName || "Reply"}
                                  {reply.createdAt
                                    ? ` · ${moment(reply.createdAt).format("LL")}`
                                    : ""}
                                </p>
                                <p className="text-sm text-gray-300">
                                  {reply.comment}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <UserDetails
        open={sellerModalOpen}
        setOpen={setSellerModalOpen}
        data={sellerData?.data || sellerData}
      />
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex justify-between gap-3 bg-[#21424617] py-3 px-3 border-b border-[#FFFFFF14]">
      <h4 className="text-gray-400">{label}</h4>
      <div className="font-medium text-[#cad1d6] text-right">{value}</div>
    </div>
  );
}
