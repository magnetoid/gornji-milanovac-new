import { MetadataRoute } from 'next';
import { getPosts, getListings } from '@/lib/directus';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://new.gornji-milanovac.com';

  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/vesti`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/oglasi`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/o-gradu`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/kontakt`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ];

  let postUrls: MetadataRoute.Sitemap = [];
  let listingUrls: MetadataRoute.Sitemap = [];

  try {
    const posts = await getPosts({ limit: 1000 });
    postUrls = posts.map((post) => ({
      url: `${baseUrl}/vesti/${post.slug}`,
      lastModified: post.published_at ? new Date(post.published_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Error fetching posts for sitemap:', error);
  }

  try {
    const listings = await getListings({ limit: 1000 });
    listingUrls = listings.map((listing) => ({
      url: `${baseUrl}/oglasi/${listing.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error('Error fetching listings for sitemap:', error);
  }

  return [...staticPages, ...postUrls, ...listingUrls];
}
