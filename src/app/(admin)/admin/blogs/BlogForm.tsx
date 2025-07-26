
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useTransition, useCallback, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { XCircle, Loader2, UploadCloud, CheckCircle2, Trash2, Plus } from 'lucide-react';
import Image from 'next/image';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

import { upsertBlog, checkSlug, getCategories, addCategory, deleteCategory, type SerializableBlog, type Category } from './actions';
import { useToast } from '@/hooks/use-toast';
import { storage } from '@/lib/firebase';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';


const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

const BlogFormSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters."),
    slug: z.string().min(3, "Slug must be at least 3 characters.").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens."),
    description: z.string().min(10, "Description must be at least 10 characters."),
    content: z.string().min(50, "Content must be at least 50 characters."),
    categories: z.array(z.string()).min(1, "Please select at least one category."),
    isPublished: z.boolean(),
});

type BlogFormData = z.infer<typeof BlogFormSchema>;

const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') 
    .replace(/[^\w-]+/g, '') 
    .replace(/--+/g, '-'); 

export function BlogForm({ blog }: { blog?: SerializableBlog | null }) {
    const router = useRouter();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'unique' | 'taken'>('idle');
    const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
    const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(blog?.image || null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const [newCategoryName, setNewCategoryName] = useState("");
    const [isAddingCategory, startAddCategoryTransition] = useTransition();

    const [isDeleteCategoryAlertOpen, setDeleteCategoryAlertOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const [isDeletingCategory, startDeleteCategoryTransition] = useTransition();

    const form = useForm<BlogFormData>({
        resolver: zodResolver(BlogFormSchema),
        defaultValues: {
            title: blog?.title || '',
            slug: blog?.slug || '',
            description: blog?.description || '',
            content: blog?.content || '',
            categories: blog?.categories || [],
            isPublished: blog?.isPublished || false,
        },
    });

     useEffect(() => {
        const fetchInitialData = async () => {
            setIsCategoriesLoading(true);
            try {
                const cats = await getCategories();
                setAvailableCategories(Array.isArray(cats) ? cats : []);
            } catch (error) {
                toast({ variant: 'destructive', title: "Error", description: "Failed to load categories." });
            } finally {
                setIsCategoriesLoading(false);
            }
        };
        fetchInitialData();
    }, [toast]);

    const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        form.setValue('title', newTitle);
        if (!blog?.id) { 
            const newSlug = slugify(newTitle);
            form.setValue('slug', newSlug);
            setSlugStatus('idle'); 
            if (newSlug.length > 2) {
                // Debounced check happens in useEffect
            }
        }
    }, [form, blog?.id]);

    const performSlugCheck = useCallback(async (slug: string) => {
        if (slug.length < 3) {
            setSlugStatus('idle');
            return;
        }
         if (blog?.slug === slug && blog?.id) {
            setSlugStatus('unique');
            return;
        }
        setSlugStatus('checking');
        const result = await checkSlug(slug, blog?.id || null);
        setSlugStatus(result.isUnique ? 'unique' : 'taken');
    }, [blog?.id, blog?.slug]);

    useEffect(() => {
        const slugValue = form.watch('slug');
        if (slugValue.length < 3) {
            setSlugStatus('idle');
            return;
        }
        const handler = setTimeout(() => {
            performSlugCheck(slugValue);
        }, 500);
        return () => clearTimeout(handler);
    }, [form.watch('slug'), performSlugCheck]);

    const processFile = (file: File) => {
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                 toast({ variant: 'destructive', title: 'File too large', description: 'Image must be less than 5MB.' });
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    };

    const uploadImage = async (): Promise<string | null> => {
        if (!imageFile) return blog?.image || null;
        
        setIsUploading(true);
        setUploadProgress(0);

        const storageRef = ref(storage, `blogs/${Date.now()}_${imageFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, imageFile);

        return new Promise((resolve, reject) => {
            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                },
                (error) => {
                    console.error("Upload failed", error);
                    toast({ variant: 'destructive', title: 'Upload Failed', description: error.message });
                    setIsUploading(false);
                    reject(error);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        setIsUploading(false);
                        resolve(downloadURL);
                    });
                }
            );
        });
    };
    
     const onSubmit = async (formData: BlogFormData) => {
        if (slugStatus !== 'unique') {
            toast({ variant: 'destructive', title: 'Error', description: 'The slug must be unique. Please choose another one.' });
            return;
        }

        if (!imagePreview) {
            toast({ variant: 'destructive', title: 'Error', description: 'A featured image is required.' });
            return;
        }

        startTransition(async () => {
            try {
                let imageUrl = blog?.image || null;
                if (imageFile) {
                    imageUrl = await uploadImage();
                }

                if (!imageUrl) {
                    toast({ variant: 'destructive', title: 'Image Error', description: 'Image is required but was not found or failed to upload.' });
                    return;
                }
                
                const finalData = { ...formData, image: imageUrl };
                const result = await upsertBlog(blog?.id || null, finalData);

                if (result.success) {
                    toast({ title: blog?.id ? 'Blog Updated' : 'Blog Created' });
                    router.push('/admin/blogs');
                    router.refresh(); 
                } else {
                    toast({ variant: 'destructive', title: 'Save Error', description: result.error });
                }
            } catch (error) {
                 toast({
                    variant: 'destructive',
                    title: 'An Unexpected Error Occurred',
                    description: (error instanceof Error) ? error.message : 'Please check the console for more details.',
                });
            }
        });
    };

    const handleAddCategory = async () => {
        if (newCategoryName.trim() === "") return;
        startAddCategoryTransition(async () => {
            const result = await addCategory(newCategoryName);
            if (result.success && result.category) {
                setAvailableCategories(prev => [...prev, result.category!]);
                setNewCategoryName("");
                toast({ title: "Category added" });
            } else {
                toast({ variant: 'destructive', title: "Error", description: result.error });
            }
        });
    }

    const confirmDeleteCategory = (category: Category) => {
        setCategoryToDelete(category);
        setDeleteCategoryAlertOpen(true);
    };

    const handleDeleteCategory = () => {
        if (!categoryToDelete) return;
        startDeleteCategoryTransition(async () => {
            const result = await deleteCategory(categoryToDelete.id);
            if (result.success) {
                toast({ title: "Category Deleted" });
                setAvailableCategories(prev => prev.filter(cat => cat.id !== categoryToDelete.id));
                const currentSelected = form.getValues('categories');
                form.setValue('categories', currentSelected.filter(catName => catName !== categoryToDelete.name));
            } else {
                toast({ variant: 'destructive', title: "Error", description: result.error });
            }
            setDeleteCategoryAlertOpen(false);
            setCategoryToDelete(null);
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Content</CardTitle>
                                <CardDescription>Write the main content of your blog post here.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Title</FormLabel>
                                                <FormControl><Input placeholder="Your Awesome Blog Title" {...field} onChange={handleTitleChange} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="slug"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Slug</FormLabel>
                                                <div className="relative">
                                                    <FormControl><Input placeholder="your-awesome-slug" {...field} /></FormControl>
                                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                        {slugStatus === 'checking' && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                                                        {slugStatus === 'unique' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                                        {slugStatus === 'taken' && <XCircle className="h-4 w-4 text-destructive" />}
                                                    </div>
                                                </div>
                                                {slugStatus === 'taken' && <p className="text-sm font-medium text-destructive">This slug is already in use.</p>}
                                                <FormDescription>The unique URL for this post.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="content"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Content</FormLabel>
                                            <FormControl>
                                                <div data-color-mode="light">
                                                    <MDEditor value={field.value} onChange={field.onChange} height={400} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Short Description (Excerpt)</FormLabel>
                                            <FormControl><Textarea placeholder="A brief summary that appears in list views." {...field} rows={3} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-1 space-y-8">
                        <Card>
                            <CardHeader><CardTitle>Publishing</CardTitle></CardHeader>
                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="isPublished"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel>Status</FormLabel>
                                                <FormDescription>Publish this post to make it visible.</FormDescription>
                                            </div>
                                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Organization</CardTitle></CardHeader>
                            <CardContent className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="categories"
                                    render={() => (
                                        <FormItem>
                                            <div className="mb-4">
                                                <FormLabel className="text-base">Categories</FormLabel>
                                                <FormDescription>Select one or more categories.</FormDescription>
                                            </div>
                                            <div className="space-y-4 rounded-md border p-4">
                                                <ScrollArea className="h-40">
                                                    <div className="space-y-2 pr-2">
                                                    {isCategoriesLoading && <p className="text-sm text-muted-foreground">Loading categories...</p>}
                                                    {!isCategoriesLoading && availableCategories.length === 0 && <p className="text-sm text-muted-foreground">No categories yet. Add one below.</p>}
                                                    {availableCategories.map((category) => (
                                                        <div key={category.id} className="flex items-center justify-between">
                                                            <FormField
                                                                control={form.control}
                                                                name="categories"
                                                                render={({ field }) => (
                                                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                                        <FormControl>
                                                                            <Checkbox
                                                                                checked={field.value.includes(category.name)}
                                                                                onCheckedChange={(checked) => {
                                                                                    return checked
                                                                                        ? field.onChange([...field.value, category.name])
                                                                                        : field.onChange(field.value.filter((value) => value !== category.name));
                                                                                }}
                                                                            />
                                                                        </FormControl>
                                                                        <FormLabel className="font-normal cursor-pointer text-sm">{category.name}</FormLabel>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => confirmDeleteCategory(category)}>
                                                                <Trash2 className="h-3 w-3" />
                                                                <span className="sr-only">Delete category {category.name}</span>
                                                            </Button>
                                                        </div>
                                                        ))}
                                                    </div>
                                                </ScrollArea>
                                                <Separator />
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium">Add new category</p>
                                                    <div className="flex gap-2">
                                                        <Input placeholder="New category..." value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}/>
                                                        <Button type="button" variant="secondary" size="icon" onClick={handleAddCategory} disabled={isAddingCategory || newCategoryName.trim() === ''}>
                                                            {isAddingCategory ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                                            <span className="sr-only">Add Category</span>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormItem>
                                    <FormLabel>Featured Image</FormLabel>
                                    <FormControl>
                                        <div className="w-full">
                                            <label htmlFor="image-upload" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                                                className={cn("flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80 transition-colors", imagePreview && "border-solid p-2", isDragging && "border-primary bg-primary/10")}>
                                                {imagePreview ? (
                                                     <div className="relative w-full h-full"><Image src={imagePreview} alt="Image preview" fill className="object-cover rounded-md" /></div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                                                        <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                                        <p className="text-xs text-muted-foreground">PNG, JPG or WEBP (MAX. 5MB)</p>
                                                    </div>
                                                )}
                                            </label>
                                            <input id="image-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} />
                                        </div>
                                    </FormControl>
                                    {isUploading && (
                                        <div className="mt-2">
                                            <Progress value={uploadProgress} className="w-full" />
                                            <p className="text-xs text-center text-muted-foreground mt-1">{`Uploading... ${Math.round(uploadProgress)}%`}</p>
                                        </div>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => router.push('/admin/blogs')}>Cancel</Button>
                    <Button type="submit" disabled={isPending || slugStatus !== 'unique' || isUploading}>
                        {(isPending || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isUploading ? 'Uploading...' : (blog?.id ? 'Update Post' : 'Create Post')}
                    </Button>
                </div>
            </form>
             <AlertDialog open={isDeleteCategoryAlertOpen} onOpenChange={setDeleteCategoryAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete the category "{categoryToDelete?.name}" and remove it from all associated blog posts. This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteCategory} className="bg-destructive hover:bg-destructive/90" disabled={isDeletingCategory}>
                             {isDeletingCategory ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Form>
    );
}
