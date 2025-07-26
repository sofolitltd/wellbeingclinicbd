
import { MetadataRoute } from 'next';
import { getPublishedBlogs } from '@/app/(website)/blogs/actions';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wellbeingclinic.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/services`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/blogs`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/appointment`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
  ];

  // Dynamic blog pages
  const blogs = await getPublishedBlogs();
  const blogRoutes: MetadataRoute.Sitemap = blogs.map(blog => ({
    url: `${siteUrl}/blogs/${blog.slug}`,
    lastModified: new Date(blog.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...blogRoutes];
}
