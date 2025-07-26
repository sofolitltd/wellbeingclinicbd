
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, query, where, Timestamp, limit, orderBy } from 'firebase/firestore';

export interface Blog {
    id: string;
    slug: string;
    title: string;
    categories: string[];
    image: string;
    description: string;
    content: string;
    isPublished: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export type SerializableBlog = Omit<Blog, 'createdAt' | 'updatedAt'> & {
    createdAt: string;
    updatedAt: string;
};

export async function getPublishedBlogs(): Promise<SerializableBlog[]> {
    const blogsCollection = collection(db, 'blogs');
    // Query without the 'where' clause to avoid needing a composite index, then filter in-code.
    const q = query(
        blogsCollection, 
        orderBy('createdAt', 'desc')
    );
    const blogSnapshot = await getDocs(q);

    const blogs: SerializableBlog[] = blogSnapshot.docs
        .map(doc => {
            const data = doc.data() as Omit<Blog, 'id'>;
            const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString();
            const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : new Date().toISOString();
            return {
                id: doc.id,
                ...data,
                slug: data.slug,
                title: data.title,
                categories: data.categories,
                image: data.image,
                description: data.description,
                content: data.content,
                isPublished: data.isPublished,
                createdAt,
                updatedAt
            };
        })
        .filter(blog => blog.isPublished); // Filter for published blogs here.
    
    return blogs;
}


export async function getPublishedBlogBySlug(slug: string): Promise<SerializableBlog | null> {
    const blogsCollection = collection(db, 'blogs');
    const q = query(blogsCollection, where("slug", "==", slug), where("isPublished", "==", true), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null;
    }

    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data() as Omit<Blog, 'id'>;

    const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString();
    const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : new Date().toISOString();

    return {
        id: docSnap.id,
        ...data,
        createdAt,
        updatedAt
    };
}
