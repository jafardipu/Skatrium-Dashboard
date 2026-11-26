import { tagTypes } from "../tagTypes";
import { baseApi } from "./baseApi";

const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminProducts: builder.query({
      query: (params) => ({
        url: "/admin/products",
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.product],
    }),

    getAdminProductDetails: builder.query({
      query: (productId: string) => ({
        url: `/admin/products/${productId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, productId) => [
        { type: tagTypes.product, id: productId },
        tagTypes.product,
      ],
    }),

    updateProductStatus: builder.mutation({
      query: ({
        productId,
        status,
      }: {
        productId: string;
        status: "active" | "inactive";
      }) => ({
        url: `/admin/products/${productId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: [tagTypes.product],
    }),

    deleteProduct: builder.mutation({
      query: (productId: string) => ({
        url: `/admin/products/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.product],
    }),
  }),
});

export const {
  useGetAdminProductsQuery,
  useGetAdminProductDetailsQuery,
  useUpdateProductStatusMutation,
  useDeleteProductMutation,
} = productApi;
