import HeritageDetailPage from "@/views/heritage-detail/ui/HeritageDetailPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <HeritageDetailPage id={id} />;
}
