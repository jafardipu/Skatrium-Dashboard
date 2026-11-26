"use client";

import { TAdminProduct } from "@/types/product";
import { Eye } from "lucide-react";
import Link from "next/link";
import { Tooltip } from "antd";
import ProductDeleteButton from "./ProductDeleteButton";

type Props = {
  product: TAdminProduct;
  showView?: boolean;
  showDelete?: boolean;
  redirectOnDelete?: boolean;
};

export default function ProductActionButtons({
  product,
  showView = true,
  showDelete = true,
  redirectOnDelete = false,
}: Props) {
  return (
    <div className="flex items-center gap-3">
      {showView && (
        <Tooltip title="View details">
          <Link href={`/admin/products/${product._id}`}>
            <Eye size={20} className="text-[#78C0A8] cursor-pointer" />
          </Link>
        </Tooltip>
      )}
      {showDelete && (
        <ProductDeleteButton
          product={product}
          redirectOnSuccess={redirectOnDelete}
        />
      )}
    </div>
  );
}
