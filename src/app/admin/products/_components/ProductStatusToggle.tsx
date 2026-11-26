"use client";

import { useUpdateProductStatusMutation } from "@/redux/api/productApi";
import { TAdminProduct } from "@/types/product";
import { getActualError } from "@/utils/handleError";
import { isProductActive } from "@/utils/productHelpers";
import { Modal, Switch } from "antd";
import { toast } from "sonner";

type Props = {
  product: TAdminProduct;
  onUpdated?: (product: TAdminProduct) => void;
};

export default function ProductStatusToggle({ product, onUpdated }: Props) {
  const [updateStatus, { isLoading }] = useUpdateProductStatusMutation();
  const isActive = isProductActive(product);

  const applyStatus = async (status: "active" | "inactive") => {
    try {
      const res = await updateStatus({
        productId: product._id,
        status,
      }).unwrap();

      toast.success(
        res?.message ||
          (status === "active"
            ? "Product activated successfully"
            : "Product deactivated successfully"),
      );

      const updated = (res?.data || {
        ...product,
        isActive: status === "active",
      }) as TAdminProduct;

      onUpdated?.(updated);
    } catch (error) {
      toast.error(getActualError(error) || "Failed to update product status");
    }
  };

  const handleToggle = (checked: boolean) => {
    if (checked) {
      applyStatus("active");
      return;
    }

    Modal.confirm({
      title: "Make this product inactive?",
      content:
        "It will be hidden from everyone in the app. You can activate it again anytime.",
      okText: "Deactivate",
      cancelText: "Cancel",
      onOk: () => applyStatus("inactive"),
    });
  };

  return (
    <Switch
      checked={isActive}
      loading={isLoading}
      disabled={isLoading}
      checkedChildren="Active"
      unCheckedChildren="Inactive"
      className={isActive ? "!bg-[#4BB54B]" : ""}
      onChange={handleToggle}
    />
  );
}
