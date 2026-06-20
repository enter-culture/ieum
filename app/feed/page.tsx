import HeritageFeed from '@/components/HeritageFeed'
import { heritageList } from '@/data/heritage'

export default function FeedPage() {
  return <HeritageFeed items={heritageList} />
}
