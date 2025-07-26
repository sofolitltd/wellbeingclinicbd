import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { getPublishedBlogs } from './actions';
import { BlogClientPage } from './BlogClientPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blogs',
  description: 'Explore insights and advice on mental health, wellness, and personal growth from the experts at Wellbeing Clinic in Bangladesh.',
};


export default async function BlogPage() {
    const blogs = await getPublishedBlogs();

  return (
    <>
      <Breadcrumbs items={[{ label: 'Blogs' }]} />
      <BlogClientPage blogs={blogs} />
    </>
  );
}
