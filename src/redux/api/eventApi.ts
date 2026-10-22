import { tagTypes } from "../tagTypes";
import { baseApi } from "./baseApi";

const eventApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllEventData: builder.query({
      query: (params) => ({
        url: "/event",
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.event, tagTypes.dashboard],
    }),
    deleteEvent: builder.mutation({
      query: (id) => ({
        url: `/event/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.event, tagTypes.dashboard],
    }),
  }),
});

export const { useGetAllEventDataQuery, useDeleteEventMutation } = eventApi;
