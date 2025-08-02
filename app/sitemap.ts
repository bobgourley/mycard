import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // Fetch all user profiles from the database
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('username, updated_at')
      .order('username')

    if (error) {
      console.error('Error fetching profiles for sitemap:', error)
      // Return basic sitemap if database query fails
      return getBasicSitemap()
    }

    // Generate sitemap entries
    return generateSitemap(profiles || [])
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return basic sitemap if there's any error
    return getBasicSitemap()
  }
}

function generateSitemap(profiles: Array<{ username: string; updated_at?: string }>): MetadataRoute.Sitemap {
  const baseUrl = 'https://123l.ink'
  const currentDate = new Date()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/auth/setup-profile`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  // User profile pages
  const userPages: MetadataRoute.Sitemap = profiles.map(profile => ({
    url: `${baseUrl}/${encodeURIComponent(profile.username)}`,
    lastModified: profile.updated_at ? new Date(profile.updated_at) : currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Combine all pages
  return [...staticPages, ...userPages]
}

function getBasicSitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://123l.ink'
  const currentDate = new Date()

  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/auth/setup-profile`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]
}
