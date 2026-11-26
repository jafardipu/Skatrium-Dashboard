import ProductDetailsView from "./_components/ProductDetailsView";

type Props = {
  params: { productId: string };
};

export default function ProductDetailsPage({ params }: Props) {
  return <ProductDetailsView productId={params.productId} />;
}
