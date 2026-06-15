export interface Episode {
  id: number
  episodeNumber: number
  title: string
  duration: string
  playUrl: string
}

export interface Drama {
  id: string
  title: string
  cover: string
  category: string[]
  region: string
  year: number
  rating: number
  description: string
  episodes: Episode[]
  tags: string[]
  updateStatus: string
  views: number
  cast?: string[]
  director?: string
}

export interface BannerItem {
  id: string
  title: string
  cover: string
  description: string
  tags: string[]
}

export interface HomeData {
  banners: BannerItem[]
  hotDramas: Drama[]
  newDramas: Drama[]
  rankings: Drama[]
}

export type CategoryType = '甜宠' | '逆袭' | '悬疑' | '古装' | '都市' | '虐恋' | '奇幻' | '喜剧'
export type RegionType = '大陆' | '韩国' | '日本' | '欧美' | '泰国'
export type SortType = '热门' | '最新' | '评分'
