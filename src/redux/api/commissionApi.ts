import { tagTypes } from "../tagTypes";
import { baseApi } from "./baseApi";

const commissionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCommission: builder.query({
      query: () => ({
        url: "/admin/commission",
        method: "GET",
      }),
      providesTags: [tagTypes.setting],
    }),
    updateCommission: builder.mutation({
      query: (body: {
        productFeePercent?: number;
        eventFeePercent?: number;
      }) => ({
        url: "/admin/commission",
        method: "PATCH",
        body,
      }),
      invalidatesTags: [tagTypes.setting],
    }),
  }),
});

export const { useGetCommissionQuery, useUpdateCommissionMutation } =
  commissionApi;
