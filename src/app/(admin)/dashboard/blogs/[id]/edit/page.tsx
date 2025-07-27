
import { getBlog } from '../../../admin/blogs/actions';
import { BlogForm } from '../../BlogForm';
import { notFound } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';


export default async function EditBlogPage({ params }: { params: { id: string } }) {
    const blog = await getBlog(params.id);

    if (!blog) {
        notFound();
    }

    return (
         <>
            <header className="p-4 border-b flex items-center gap-4 bg-card sticky top-0 z-10 md:m-2 md:mb-0 md:rounded-t-lg md:border md:top-2">
                <SidebarTrigger />
                <h1 className="text-xl font-semibold tracking-tight">Edit Blog Post</h1>
            </header>
            <div className="p-4 bg-card min-h-[calc(100vh-65px-1rem)] md:m-2 md:mt-0 md:rounded-b-lg md:border-x md:border-b">
                <BlogForm blog={blog} />
            </div>
        </>
    );
}
