import HeritageFeed from '@/components/HeritageFeed'
import { heritageList } from '@/data/heritage'

export default function Home() {
  return <HeritageFeed items={heritageList} />
}
