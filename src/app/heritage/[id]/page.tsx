import HeritageDetailPage from "@/views/heritage-detail/ui/HeritageDetailPage";

export default function Page({ params }: { params: { id: string } }) {
  return <HeritageDetailPage id={params.id} />;
}
