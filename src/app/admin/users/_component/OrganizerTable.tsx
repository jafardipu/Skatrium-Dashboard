"use client";
import { Image, Input, TableProps } from "antd";
import DataTable from "@/utils/DataTable";
import { Eye } from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDebounce } from "use-debounce";
import { useGetAllUserQuery } from "@/redux/api/userApi";
import BlockUser from "@/components/shared/BlockUser";
import UserDelete from "@/components/shared/DeleteUser";
import OrganizerTableDetails from "@/components/(adminDashboard)/user/OrganizerUserDetails";
import AccountStatusBadge from "@/components/shared/AccountStatusBadge";
import SubscriptionCell from "@/components/shared/SubscriptionCell";
import { extractUsersList } from "@/utils/subscriptionHelpers";

type TUser = {
  _id: string | number;
  fullName: string;
  email: string;
  date: string;
  status: string;
  isActive: boolean;
  image: { url: string };
  accountStatus?: string;
  subscription?: any;
  subscriptionExpired?: boolean;
  createdAt?: string;
};

const OrganizerTable = () => {
  const searchParams = useSearchParams();
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "12";
  const [searchText, setSearchText] = useState("");
  const [searchValue] = useDebounce(searchText, 500);
  const [open, setOpen] = useState<boolean>(false);
  const [currentData, setCurrentData] = useState<TUser>();

  const queries: Record<string, string> = { role: "ORGANIZER" };
  if (page) queries.page = page;
  if (limit) queries.limit = limit;
  if (searchValue) {
    delete queries.page;
    delete queries.limit;
    queries.search = searchValue;
  }

  const { data: usersData, isLoading } = useGetAllUserQuery(queries);
  const { users, total } = extractUsersList(usersData);

  const columns: TableProps<TUser>["columns"] = [
    {
      title: "ID",
      dataIndex: "id",
      render: (_, __, index) => (
        <p className="text-[#cad1d6]">
          {`# ${
            Number(page) === 1
              ? index + 1
              : (Number(page) - 1) * Number(limit) + index + 1
          }`}
        </p>
      ),
    },
    {
      title: "User",
      dataIndex: "fullName",
      render: (text, record) => (
        <div className="flex items-center gap-x-3">
          {record?.image?.url ? (
            <Image
              src={record?.image?.url}
              alt="profile-picture"
              width={40}
              height={40}
              className="size-10 aspect-square object-cover rounded-full"
            />
          ) : (
            <div className="size-10 aspect-square object-cover rounded-full bg-[#312912] flex items-center justify-center text-white text-sm font-semibold">
              {record?.fullName?.charAt(0).toUpperCase()}
            </div>
          )}
          <p className="font-bold text-[#cad1d6]">{text}</p>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      render: (text) => <span className="text-[#cad1d6]">{text}</span>,
    },
    {
      title: "Account status",
      dataIndex: "accountStatus",
      render: (_, record) => <AccountStatusBadge user={record} />,
    },
    {
      title: "Subscription",
      dataIndex: "subscription",
      render: (_, record) => <SubscriptionCell user={record} />,
    },
    {
      title: "Join Date",
      dataIndex: "createdAt",
      render: (text) => (
        <p className="text-[#cad1d6]">{moment(text).format("LL")}</p>
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Eye
            size={22}
            color="#78C0A8"
            onClick={() => {
              setOpen(true);
              setCurrentData(record);
            }}
            className="cursor-pointer"
          />
          <BlockUser id={record?._id} isActive={record?.isActive} />
          <UserDelete id={record?._id} />
        </div>
      ),
    },
  ];

  return (
    <div className="border border-[#FFFFFF33]/[0.2] rounded-t-xl">
      <div className="flex items-center justify-between gap-3 flex-wrap py-2 px-2">
        <h4 className="text-xl font-semibold text-[#cad1d6]">All Organisers</h4>
        <Input.Search
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search here"
          size="large"
          className="max-w-[300px]"
        />
      </div>
      <div className="rounded-2xl">
        <DataTable
          columns={columns}
          data={users}
          isLoading={isLoading}
          pageSize={Number(limit)}
          total={total}
        />
        <OrganizerTableDetails open={open} setOpen={setOpen} data={currentData} />
      </div>
    </div>
  );
};

export default OrganizerTable;
