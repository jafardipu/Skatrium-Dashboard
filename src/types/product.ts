export type TProductImage = {
  id?: string;
  url: string;
  _id?: string;
};

export type TProductHost = {
  _id: string;
  fullName?: string;
  email?: string;
  image?: string | { url?: string };
  businessName?: string;
  phoneNumber?: string;
};

export type TProductCategory = {
  _id: string;
  name: string;
};

export type TProductReviewReply = {
  user?: string | { _id?: string; fullName?: string };
  comment?: string;
  createdAt?: string;
};

export type TProductReview = {
  _id: string;
  rating: number;
  comment?: string;
  images?: TProductImage[];
  isAnonymous?: boolean;
  user?: {
    _id?: string;
    fullName?: string;
    image?: string | { url?: string };
  };
  replies?: TProductReviewReply[];
  createdAt?: string;
};

export type TAdminProduct = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  discount?: number;
  discountPrice?: number;
  shippingCost?: number;
  currency?: string;
  stock?: number;
  material?: string;
  colors?: string[];
  sizes?: string[];
  images?: TProductImage[];
  category?: TProductCategory | string;
  host?: TProductHost | string;
  reviews?: TProductReview[];
  /** true = Active, false = Inactive; missing → treat as Active */
  isActive?: boolean;
  /** Always false in dashboard responses; deleted products are never returned */
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type TProductsPagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type TProductsListData = {
  products: TAdminProduct[];
  pagination: TProductsPagination;
};
