import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Fetch all user profiles from the database
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('username, updated_at')
      .order('username')

    if (error) {
      console.error('Error fetching profiles for sitemap:', error)
      // Return basic sitemap if database query fails
      return new NextResponse(getBasicSitemap(), {
        headers: {
          'Content-Type': 'application/xml',
        },
      })
    }

    // Generate sitemap XML
    const sitemap = generateSitemap(profiles || [])

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return basic sitemap if there's any error
    return new NextResponse(getBasicSitemap(), {
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  }
}

function generateSitemap(profiles: Array<{ username: string; updated_at?: string }>) {
  const baseUrl = 'https://123l.ink'
  const currentDate = new Date().toISOString()

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '1.0'
    },
    {
      url: `${baseUrl}/auth/setup-profile`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.7'
    }
  ]

  // User profile pages
  const userPages = profiles.map(profile => ({
    url: `${baseUrl}/${encodeURIComponent(profile.username)}`,
    lastmod: profile.updated_at ? new Date(profile.updated_at).toISOString() : currentDate,
    changefreq: 'weekly',
    priority: '0.8'
  }))

  // Combine all pages
  const allPages = [...staticPages, ...userPages]

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return xml
}

function getBasicSitemap() {
  const baseUrl = 'https://123l.ink'
  const currentDate = new Date().toISOString()

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/auth/setup-profile</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`
}
