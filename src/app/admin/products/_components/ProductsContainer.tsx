"use client";

import { useGetAllProductCategoryQuery } from "@/redux/api/productCategoryApi";
import { useGetAdminProductsQuery } from "@/redux/api/productApi";
import { TAdminProduct } from "@/types/product";
import { useUpdateSearchParams } from "@/hooks/useUpdateSearchParams";
import {
  formatMoney,
  getAverageRating,
  getCategoryName,
  getSellerName,
} from "@/utils/productHelpers";
import { Image, Input, Select, Table, TableProps, Tabs } from "antd";
import moment from "moment";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import ProductActionButtons from "./ProductActionButtons";
import ProductStatusToggle from "./ProductStatusToggle";

const statusTabs = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
];

export default function ProductsContainer() {
  const searchParams = useSearchParams();
  const updateParams = useUpdateSearchParams();

  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || undefined;
  const status = searchParams.get("status") || "all";

  const [searchText, setSearchText] = useState(search);
  const [debouncedSearch] = useDebounce(searchText, 400);

  useEffect(() => {
    setSearchText(search);
  }, [search]);

  useEffect(() => {
    if ((search || "") === (debouncedSearch || "")) return;
    updateParams({ search: debouncedSearch || null, page: "1" });
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const queries = useMemo(() => {
    const params: Record<string, string> = {
      page,
      limit,
      status,
    };
    if (debouncedSearch) params.search = debouncedSearch;
    if (category) params.category = category;
    return params;
  }, [page, limit, debouncedSearch, category, status]);

  const { data, isLoading, isFetching } = useGetAdminProductsQuery(queries);
  const { data: categoriesData } = useGetAllProductCategoryQuery({
    limit: 999,
  });

  const products: TAdminProduct[] =
    data?.data?.products || data?.data?.data || data?.data?.result || [];
  const pagination = data?.data?.pagination || data?.data?.meta || {};
  const total = pagination?.total ?? 0;

  useEffect(() => {
    if (isLoading || isFetching) return;
    if (products.length === 0 && Number(page) > 1) {
      updateParams({ page: String(Number(page) - 1) });
    }
  }, [products.length, page, isLoading, isFetching]); // eslint-disable-line react-hooks/exhaustive-deps

  const categoryOptions =
    categoriesData?.data?.map((item: { _id: string; name: string }) => ({
      value: item._id,
      label: item.name,
    })) || [];

  const columns: TableProps<TAdminProduct>["columns"] = [
    {
      title: "Product",
      dataIndex: "name",
      render: (_, record) => (
        <div className="flex items-center gap-3 min-w-[220px]">
          <Image
            src={record.images?.[0]?.url}
            alt={record.name}
            width={48}
            height={48}
            className="rounded-md object-cover !w-12 !h-12"
            fallback="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'><rect width='100%' height='100%' fill='%23333333'/><text x='50%' y='50%' dominant-baseline='central' text-anchor='middle' fill='%23999' font-size='10'>N/A</text></svg>"
          />
          <p className="font-semibold text-[#cad1d6] line-clamp-2">
            {record.name}
          </p>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      render: (_, record) => (
        <span className="text-[#cad1d6]">{getCategoryName(record.category)}</span>
      ),
    },
    {
      title: "Seller",
      dataIndex: "host",
      render: (_, record) => (
        <span className="text-[#cad1d6]">
          {getSellerName(
            typeof record.host === "string" ? undefined : record.host,
          )}
        </span>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      render: (_, record) => {
        const currency = record.currency || "USD";
        const hasDiscount =
          (record.discount || 0) > 0 && record.discountPrice != null;
        return hasDiscount ? (
          <div>
            <p className="font-semibold text-[#cad1d6]">
              {formatMoney(record.discountPrice, currency)}
            </p>
            <p className="text-xs text-gray-500 line-through">
              {formatMoney(record.price, currency)}
            </p>
          </div>
        ) : (
          <p className="font-semibold text-[#cad1d6]">
            {formatMoney(record.price, currency)}
          </p>
        );
      },
    },
    {
      title: "Stock",
      dataIndex: "stock",
      render: (stock?: number) =>
        stock === 0 ? (
          <span className="text-[#ee0808] font-medium">Out of stock</span>
        ) : (
          <span className="text-[#cad1d6]">{stock ?? "N/A"}</span>
        ),
    },
    {
      title: "Rating",
      dataIndex: "reviews",
      render: (_, record) => {
        const { average, count } = getAverageRating(record.reviews);
        if (!count) return <span className="text-gray-500">No reviews</span>;
        return (
          <span className="text-[#cad1d6]">
            {average.toFixed(1)} ★{" "}
            <span className="text-gray-500">({count})</span>
          </span>
        );
      },
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      render: (value?: string) => (
        <span className="text-[#cad1d6]">
          {value ? moment(value).format("LL") : "N/A"}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      render: (_, record) => <ProductStatusToggle product={record} />,
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      render: (_, record) => <ProductActionButtons product={record} />,
    },
  ];

  return (
    <div className="border border-[#FFFFFF33]/[0.2] rounded-xl">
      <div className="flex flex-col gap-3 py-3 px-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-xl font-semibold text-[#cad1d6]">Products</h4>
          <div className="flex flex-wrap items-center gap-3">
            {/* <Select
              allowClear
              placeholder="All categories"
              className="min-w-[180px]"
              value={category}
              options={categoryOptions}
              onChange={(value) =>
                updateParams({ category: value || null, page: "1" })
              }
            /> */}
            <Input.Search
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search name, seller, material..."
              size="large"
              className="max-w-[320px]"
              allowClear
              onSearch={(value) =>
                updateParams({ search: value || null, page: "1" })
              }
            />
          </div>
        </div>

        <Tabs
          activeKey={status}
          items={statusTabs}
          onChange={(key) => updateParams({ status: key, page: "1" })}
        />
      </div>

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={products}
        loading={isLoading || isFetching}
        scroll={{ x: "max-content" }}
        pagination={{
          current: Number(page),
          pageSize: Number(limit),
          total,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          onChange: (nextPage, nextPageSize) => {
            updateParams({
              page: String(nextPage),
              limit: String(nextPageSize || limit),
            });
          },
        }}
      />
    </div>
  );
}
