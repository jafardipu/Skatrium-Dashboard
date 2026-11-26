"use client";

import {
  useDeleteProductMutation,
  useUpdateProductStatusMutation,
} from "@/redux/api/productApi";
import { TAdminProduct } from "@/types/product";
import { getActualError } from "@/utils/handleError";
import { Button, Modal, Tooltip } from "antd";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  product: TAdminProduct;
  redirectOnSuccess?: boolean;
  onDeleted?: () => void;
};

export default function ProductDeleteButton({
  product,
  redirectOnSuccess = false,
  onDeleted,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation();
  const [updateStatus, { isLoading: deactivating }] =
    useUpdateProductStatusMutation();

  const busy = deleting || deactivating;

  const handleDelete = async () => {
    try {
      const res = await deleteProduct(product._id).unwrap();
      toast.success(res?.message || "Product deleted successfully");
      setOpen(false);
      onDeleted?.();
      if (redirectOnSuccess) {
        router.push("/admin/products");
      }
    } catch (error) {
      toast.error(getActualError(error) || "Failed to delete product");
    }
  };

  const handleMakeInactive = async () => {
    try {
      const res = await updateStatus({
        productId: product._id,
        status: "inactive",
      }).unwrap();
      toast.success(res?.message || "Product deactivated successfully");
      setOpen(false);
    } catch (error) {
      toast.error(getActualError(error) || "Failed to deactivate product");
    }
  };

  return (
    <>
      <Tooltip title="Delete">
        <button
          type="button"
          disabled={busy}
          onClick={() => setOpen(true)}
          className="disabled:opacity-50"
        >
          <Trash2 size={20} className="text-[#CD0335] cursor-pointer" />
        </button>
      </Tooltip>

      <Modal
        open={open}
        onCancel={() => !busy && setOpen(false)}
        footer={null}
        centered
        destroyOnClose
        title={<span className="text-red-500">Delete this product?</span>}
      >
        <p className="text-sm text-gray-300 mb-4">
          It will be removed for everyone, including this dashboard, and cannot
          be undone. If you only want to hide it, make it Inactive instead.
        </p>
        <div className="flex flex-wrap justify-end gap-2">
          <Button onClick={() => setOpen(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={handleMakeInactive} loading={deactivating} disabled={busy}>
            Make inactive instead
          </Button>
          <Button
            danger
            type="primary"
            onClick={handleDelete}
            loading={deleting}
            disabled={busy}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
