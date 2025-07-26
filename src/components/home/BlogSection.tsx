import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getPublishedBlogs } from "@/app/(website)/blogs/actions";
import { BlogList } from "./BlogList";

export async function BlogSection() {
    // Show a subset of blogs on the home page
    const homeBlogs = (await getPublishedBlogs()).slice(0, 3);

    return (
        <section className="w-full py-16 md:py-24 bg-primary/5">
            <div className="container mx-auto px-4 md:px-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-headline text-3xl font-bold tracking-wider sm:text-4xl uppercase">Explore Our Blog</h2>
                        <Button asChild className="hidden sm:inline-flex font-bold">
                            <Link href="/blogs">More Blogs</Link>
                        </Button>
                    </div>
                    <p className="text-muted-foreground md:text-lg max-w-3xl">
                        Insights and advice on mental health and wellness from our team of experts.
                    </p>
                </div>

                <BlogList blogs={homeBlogs} />
                
                 <div className="text-center mt-12 sm:hidden">
                    <Button asChild size="lg" className="font-bold transition-transform duration-300 hover:scale-105">
                        <Link href="/blogs">More Blogs</Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
