import { HeritageDetailPage } from '@/views/heritage-detail'
export default function Page({ params }: { params: { id: string } }) {
  return <HeritageDetailPage id={params.id} />
}
