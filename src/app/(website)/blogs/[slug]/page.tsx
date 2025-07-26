import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getPublishedBlogBySlug } from '../actions';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const blog = await getPublishedBlogBySlug(params.slug);
  if (!blog) {
    return {
      title: "Not Found",
      description: "The page you are looking for does not exist.",
    }
  }

  return {
    title: blog.title,
    description: blog.description,
    openGraph: {
      title: blog.title,
      description: blog.description,
      images: [
        {
          url: blog.image,
          width: 1200,
          height: 630,
          alt: blog.title,
        },
      ],
    },
  }
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const blog = await getPublishedBlogBySlug(params.slug);

  if (!blog) {
    notFound();
  }

  return (
    <>
      <Breadcrumbs items={[
        { label: 'Blogs', href: `/blogs` },
        { label: blog.title }
      ]} />
      <div 
        className="container mx-auto px-4 py-16 md:px-6"
      >
        <div className="mx-auto max-w-3xl">
          <article className="space-y-8">
             <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
                    {blog.categories.map(cat => (
                        <Badge key={cat} variant="secondary">{cat}</Badge>
                    ))}
                </div>
              <Image
                src={blog.image}
                alt={blog.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-2 text-center">
              <h1 className="font-headline text-3xl font-bold tracking-wider sm:text-4xl uppercase">{blog.title}</h1>
            </div>
            <div
              className="prose prose-lg max-w-none dark:prose-invert"
            >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {blog.content}
                </ReactMarkdown>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
