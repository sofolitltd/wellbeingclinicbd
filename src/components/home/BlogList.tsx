
'use client';

import { motion } from 'framer-motion';
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SerializableBlog } from '@/app/(admin)/blogs/actions';
import { useLoading } from '@/context/LoadingProvider';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function BlogList({ blogs }: { blogs: SerializableBlog[] }) {
    const { setLoading } = useLoading();
    return (
        <motion.div
            className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
            initial="hidden"
            animate="show"
        >
            {blogs.map((blog) => (
                <motion.div
                    key={blog.slug}
                    className="h-full"
                    variants={itemVariants}
                >
                    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group">
                        <Link href={`/blogs/${blog.slug}`} className="block h-full flex flex-col" onClick={() => setLoading(true)}>
                            <div className="overflow-hidden">
                                <Image
                                    src={blog.image}
                                    alt={blog.title}
                                    width={600}
                                    height={400}
                                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>
                            <div className="flex flex-col flex-grow">
                                <CardHeader>
                                    <div className="flex flex-wrap gap-1">
                                        {blog.categories.slice(0, 2).map(cat => <Badge key={cat} variant="secondary" className="w-fit">{cat}</Badge>)}
                                    </div>
                                    <CardTitle className="font-headline mt-2 uppercase tracking-wider">{blog.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <CardDescription>{blog.description}</CardDescription>
                                </CardContent>
                                <CardFooter>
                                    <span className="text-sm font-semibold text-primary group-hover:underline">
                                        Read More &rarr;
                                    </span>
                                </CardFooter>
                            </div>
                        </Link>
                    </Card>
                </motion.div>
            ))}
        </motion.div>
    )
}
