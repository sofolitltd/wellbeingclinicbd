
'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import type { SerializableBlog } from './actions';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function BlogClientPage({ blogs }: { blogs: SerializableBlog[] }) {
  return (
      <motion.div 
        className="container mx-auto px-4 py-16 md:px-6"
        initial="hidden"
        animate="show"
        variants={containerVariants}
      >
        <div className="space-y-12">
          <motion.div className="text-center" variants={itemVariants}>
            <h1 className="font-headline text-4xl font-bold tracking-wider sm:text-5xl uppercase">Our Blog</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Insights and advice on mental health and wellness from our team of experts.
            </p>
          </motion.div>

          <motion.div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3" variants={containerVariants}>
            {blogs.length === 0 ? (
                 <p className="col-span-full text-center text-muted-foreground">No blog posts published yet. Check back soon!</p>
            ) : (
                blogs.map((blog) => (
                    <motion.div key={blog.id} variants={itemVariants} className="h-full">
                        <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group h-full">
                        <Link href={`/blogs/${blog.slug}`} className="block h-full flex flex-col">
                            <div className="overflow-hidden">
                            <Image
                                src={blog.image}
                                alt={blog.title}
                                width={600}
                                height={400}
                                className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            </div>
                            <CardHeader>
                            <div className="flex flex-wrap gap-1">
                                {blog.categories.slice(0, 2).map(cat => <Badge key={cat} variant="secondary" className="w-fit">{cat}</Badge>)}
                            </div>
                            <CardTitle className="font-headline mt-2 uppercase tracking-normal">{blog.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow">
                            <CardDescription>{blog.description}</CardDescription>
                            </CardContent>
                            <CardFooter>
                            <span className="text-sm font-semibold text-primary group-hover:underline">
                                Read More &rarr;
                            </span>
                            </CardFooter>
                        </Link>
                        </Card>
                    </motion.div>
                ))
            )}
          </motion.div>
        </div>
      </motion.div>
  );
}
