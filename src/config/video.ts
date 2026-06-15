export interface VideoSourceConfig {
  dramaId: string
  baseUrl: string
}

export const videoSources: VideoSourceConfig[] = [
  {
    dramaId: '43',
    baseUrl: 'https://pub-8d373da3aa6943feb14da48e38dcf9f4.r2.dev/drama-43'
  }
]

export function getVideoUrl(dramaId: string, episodeId: number): string {
  const source = videoSources.find(s => s.dramaId === dramaId)
  if (source) {
    return `${source.baseUrl}/${episodeId}.mp4`
  }
  return `/videos/drama-${dramaId}/${episodeId}.mp4`
}

export function getCoverUrl(dramaId: string): string {
  const source = videoSources.find(s => s.dramaId === dramaId)
  if (source) {
    return `${source.baseUrl}/cover.jpg`
  }
  return `/videos/drama-${dramaId}/cover.jpg`
}