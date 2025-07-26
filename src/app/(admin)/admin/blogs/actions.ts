
'use server';

import { db, storage } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc, writeBatch, serverTimestamp, query, orderBy, Timestamp, where, addDoc, updateDoc } from 'firebase/firestore';
import { ref as storageRef, deleteObject } from "firebase/storage";
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const BlogSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters."),
    slug: z.string().min(3, "Slug must be at least 3 characters.").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens."),
    description: z.string().min(10, "Description must be at least 10 characters."),
    content: z.string().min(50, "Content must be at least 50 characters."),
    categories: z.array(z.string()).min(1, "Please select at least one category."),
    image: z.string().url("A featured image is required."),
    isPublished: z.boolean(),
});

export type Blog = {
    id: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
} & z.infer<typeof BlogSchema>;

export type SerializableBlog = Omit<Blog, 'createdAt' | 'updatedAt'> & {
    createdAt: string;
    updatedAt: string;
};

export async function getBlogs(): Promise<SerializableBlog[]> {
    const blogsCollection = collection(db, 'blogs');
    const q = query(blogsCollection, orderBy('createdAt', 'desc'));
    const blogSnapshot = await getDocs(q);
    
    return blogSnapshot.docs.map(doc => {
        const data = doc.data() as Omit<Blog, 'id'>;
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString();
        const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : new Date().toISOString();
        return {
            id: doc.id,
            ...data,
            createdAt,
            updatedAt
        };
    });
}

export async function getBlog(id: string): Promise<SerializableBlog | null> {
    const blogRef = doc(db, 'blogs', id);
    const blogSnap = await getDoc(blogRef);

    if (!blogSnap.exists()) {
        return null;
    }
    const data = blogSnap.data() as Omit<Blog, 'id'>;
    const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString();
    const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : new Date().toISOString();
    return {
        id: blogSnap.id,
        ...data,
        createdAt,
        updatedAt
    };
}

export async function checkSlug(slug: string, currentId: string | null): Promise<{ isUnique: boolean }> {
    const q = query(collection(db, "blogs"), where("slug", "==", slug));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return { isUnique: true };
    }
    if (currentId && querySnapshot.docs[0].id === currentId) {
        return { isUnique: true };
    }

    return { isUnique: false };
}


export async function upsertBlog(id: string | null, data: unknown): Promise<{ success: boolean; error?: string }> {
    const validation = BlogSchema.safeParse(data);
    if (!validation.success) {
        const errors = validation.error.flatten().fieldErrors;
        const errorMessage = Object.values(errors).flat().join(' ');
        return { success: false, error: errorMessage };
    }

    const blogData = validation.data;

    const slugCheckResult = await checkSlug(blogData.slug, id);
    if (!slugCheckResult.isUnique) {
        return { success: false, error: "This slug is already in use. Please choose a unique one." };
    }

    try {
        if (id) {
            const blogRef = doc(db, 'blogs', id);
            const existingBlogSnap = await getDoc(blogRef);

            if (existingBlogSnap.exists()) {
                const oldData = existingBlogSnap.data();
                const oldImageUrl = oldData.image;

                if (oldImageUrl && oldImageUrl !== blogData.image) {
                    try {
                        const oldImageRef = storageRef(storage, oldImageUrl);
                        await deleteObject(oldImageRef);
                    } catch (storageError) {
                        console.error("Failed to delete old image, but continuing with update:", storageError);
                    }
                }
            }
            
            await updateDoc(blogRef, {
                ...blogData,
                updatedAt: serverTimestamp()
            });
        } else {
            const newBlogRef = doc(collection(db, 'blogs'));
            await setDoc(newBlogRef, {
                ...blogData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        }

        revalidatePath('/');
        revalidatePath('/admin/blogs');
        revalidatePath('/blogs');
        revalidatePath(`/blogs/${blogData.slug}`);
        return { success: true };
    } catch (error) {
        console.error("Error upserting blog: ", error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Could not save blog post." };
    }
}


export async function deleteBlog(id: string): Promise<{ success: boolean }> {
    try {
        await deleteDoc(doc(db, 'blogs', id));
        revalidatePath('/');
        revalidatePath('/admin/blogs');
        revalidatePath('/blogs');
        return { success: true };
    } catch (error) {
        console.error("Error deleting blog: ", error);
        return { success: false };
    }
}

export async function deleteBlogs(ids: string[]): Promise<{ success: boolean }> {
    if (ids.length === 0) return { success: true };
    try {
        const batch = writeBatch(db);
        ids.forEach(id => {
            const blogRef = doc(db, "blogs", id);
            batch.delete(blogRef);
        });
        await batch.commit();
        revalidatePath('/');
        revalidatePath('/admin/blogs');
        revalidatePath('/blogs');
        return { success: true };
    } catch (error) {
        console.error("Error deleting blogs: ", error);
        return { success: false };
    }
}

export interface Category {
    id: string;
    name: string;
}

export interface CategoryWithPostCount extends Category {
    postCount: number;
}


export async function getCategories(): Promise<Category[]> {
    const categoriesCollection = collection(db, 'blogCategories');
    const q = query(categoriesCollection, orderBy('name'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
}

export async function getCategoryPostCounts(): Promise<Record<string, number>> {
    const blogsSnapshot = await getDocs(query(collection(db, "blogs"), where("isPublished", "==", true)));
    const counts: Record<string, number> = {};
    blogsSnapshot.forEach(doc => {
        const blog = doc.data();
        if (blog.categories && Array.isArray(blog.categories)) {
            blog.categories.forEach((categoryName: string) => {
                counts[categoryName] = (counts[categoryName] || 0) + 1;
            });
        }
    });
    return counts;
}

export async function addCategory(name: string): Promise<{ success: boolean; category?: Category; error?: string }> {
    if (!name || name.trim().length === 0) {
        return { success: false, error: "Category name cannot be empty." };
    }
    const trimmedName = name.trim();
    try {
        const q = query(collection(db, "blogCategories"), where("name", "==", trimmedName));
        const existing = await getDocs(q);
        if (!existing.empty) {
            return { success: false, error: "Category already exists." };
        }

        const docRef = await addDoc(collection(db, 'blogCategories'), { name: trimmedName });
        revalidatePath('/admin/blogs/new');
        revalidatePath('/admin/blogs/[id]/edit');
        revalidatePath('/admin/blogs/categories');
        return { success: true, category: { id: docRef.id, name: trimmedName } };
    } catch (error) {
        console.error("Error adding category:", error);
        return { success: false, error: "Could not add category." };
    }
}

export async function updateCategory(id: string, newName: string): Promise<{ success: boolean; error?: string }> {
    if (!newName || newName.trim().length === 0) {
        return { success: false, error: "Category name cannot be empty." };
    }
    const trimmedName = newName.trim();
    const categoryRef = doc(db, 'blogCategories', id);

    try {
        const categorySnap = await getDoc(categoryRef);
        if (!categorySnap.exists()) {
            return { success: false, error: "Category not found." };
        }
        const oldName = categorySnap.data().name;

        if (oldName === trimmedName) {
            return { success: true }; // No change needed
        }

        // Check if new name already exists
        const q = query(collection(db, "blogCategories"), where("name", "==", trimmedName));
        const existing = await getDocs(q);
        if (!existing.empty) {
            return { success: false, error: "A category with this name already exists." };
        }

        const batch = writeBatch(db);

        // Update category document itself
        batch.update(categoryRef, { name: trimmedName });

        // Find all blogs with the old category and update them
        const blogsToUpdateQuery = query(collection(db, "blogs"), where("categories", "array-contains", oldName));
        const blogsToUpdateSnapshot = await getDocs(blogsToUpdateQuery);
        
        blogsToUpdateSnapshot.forEach(blogDoc => {
            const blogData = blogDoc.data();
            const updatedCategories = blogData.categories.map((cat: string) => cat === oldName ? trimmedName : cat);
            batch.update(blogDoc.ref, { categories: updatedCategories });
        });

        await batch.commit();

        revalidatePath('/admin/blogs/new');
        revalidatePath('/admin/blogs/[id]/edit');
        revalidatePath('/admin/blogs/categories');
        revalidatePath('/blogs');
        return { success: true };
    } catch (error) {
        console.error("Error updating category:", error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Could not update category." };
    }
}


export async function deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
    if (!id) {
        return { success: false, error: "Category ID is required." };
    }

    try {
        const categoryRef = doc(db, 'blogCategories', id);
        const categorySnap = await getDoc(categoryRef);

        if (!categorySnap.exists()) {
            return { success: false, error: "Category not found." };
        }

        const categoryName = categorySnap.data().name;
        const batch = writeBatch(db);

        batch.delete(categoryRef);

        const blogsToUpdateQuery = query(collection(db, "blogs"), where("categories", "array-contains", categoryName));
        const blogsToUpdateSnapshot = await getDocs(blogsToUpdateQuery);
        
        blogsToUpdateSnapshot.forEach(blogDoc => {
            const blogData = blogDoc.data();
            const updatedCategories = blogData.categories.filter((cat: string) => cat !== categoryName);
            batch.update(blogDoc.ref, { categories: updatedCategories });
        });

        await batch.commit();

        revalidatePath('/admin/blogs/new');
        revalidatePath('/admin/blogs/[id]/edit');
        revalidatePath('/admin/blogs/categories');
        revalidatePath('/blogs');
        return { success: true };
    } catch (error) {
        console.error("Error deleting category:", error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Could not delete category." };
    }
}
