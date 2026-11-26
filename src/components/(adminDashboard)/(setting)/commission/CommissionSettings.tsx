"use client";

import {
  useGetCommissionQuery,
  useUpdateCommissionMutation,
} from "@/redux/api/commissionApi";
import { getActualError } from "@/utils/handleError";
import { Button, InputNumber, Segmented, Spin } from "antd";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type TabKey = "product" | "event";

export default function CommissionSettings() {
  const { data, isLoading } = useGetCommissionQuery({});
  const [updateCommission, { isLoading: saving }] =
    useUpdateCommissionMutation();

  const productFee = data?.data?.productFeePercent ?? 10;
  const eventFee = data?.data?.eventFeePercent ?? 10;

  const [activeTab, setActiveTab] = useState<TabKey>("product");
  const [inputValue, setInputValue] = useState<number | null>(productFee);

  useEffect(() => {
    setInputValue(activeTab === "product" ? productFee : eventFee);
  }, [activeTab, productFee, eventFee]);

  const helperText =
    activeTab === "product"
      ? "Platform commission from each product / shop sale"
      : "Platform commission from each event ticket sale";

  const handleSave = async () => {
    if (inputValue == null || Number.isNaN(Number(inputValue))) {
      toast.error("Please enter a valid commission percentage");
      return;
    }

    const value = Number(inputValue);
    if (value < 0 || value > 100) {
      toast.error("Commission must be between 0 and 100");
      return;
    }

    // Allow one decimal place
    if (!/^\d+(\.\d)?$/.test(String(value))) {
      toast.error("Only one decimal place is allowed");
      return;
    }

    try {
      const res = await updateCommission(
        activeTab === "product"
          ? { productFeePercent: value }
          : { eventFeePercent: value },
      ).unwrap();

      toast.success(res?.message || "Commission settings updated successfully");
    } catch (error) {
      toast.error(getActualError(error) || "Failed to update commission");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="border border-[#FFFFFF33]/[0.2] rounded-xl p-5 md:p-8 max-w-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-[#cad1d6]">
          Commission Percentage
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Manage commission for product and event earnings
        </p>
      </div>

      <Segmented
        block
        value={activeTab}
        options={[
          { label: "Product", value: "product" },
          { label: "Event", value: "event" },
        ]}
        onChange={(value) => setActiveTab(value as TabKey)}
        className="mb-6"
      />

      <div className="space-y-2 mb-6">
        <label className="block text-sm text-gray-300">
          Commission Percentage (%)
        </label>
        <InputNumber
          min={0}
          max={100}
          step={0.1}
          precision={1}
          value={inputValue}
          onChange={(value) => setInputValue(value)}
          size="large"
          className="w-full"
          addonAfter="%"
        />
        <p className="text-xs text-gray-500">{helperText}</p>
      </div>

      <Button
        type="primary"
        size="large"
        loading={saving}
        onClick={handleSave}
        className="bg-gradient-to-t from-[#E6CA6E] to-[#775806] border-none"
      >
        Save Changes
      </Button>
    </div>
  );
}
