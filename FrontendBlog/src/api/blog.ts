import { apiRequest, type ApiUser } from "./client";

export type CommentType = {
    id: number;
    author: string;
    authorId?: number;
    authorAvatar?: string;
    content: string;
    date: string;
    likes: number;
    canDelete?: boolean;
};

export type Post = {
    id: number;
    title: string;
    description: string;
    content?: string;
    category: string;
    categoryId?: string;
    image: string;
    author: string;
    authorId?: number;
    authorAvatar: string;
    date: string;
    readTime: number;
    likes: number;
    comments: number;
    featured?: boolean;
    canDelete?: boolean;
};

export type Category = {
    id: string;
    name: string;
    count: number;
    icon: string;
    description?: string;
};

export type ArticlePayload = {
    title: string;
    content: string;
    categoryId?: number | null;
    image?: string;
};

const mockPosts: Post[] = [
    {
        id: 1,
        title: "Comment apprendre React facilement",
        description: "Découvrez les bases de React, les composants, les props et les hooks. Un guide complet pour débuter avec React.",
        content: "<p>Les Hooks React ont été introduits dans React 16.8 et ont complètement changé la façon dont nous développons des applications React.</p><h2>Pourquoi utiliser les Hooks ?</h2><p>Les hooks résolvent plusieurs problèmes rencontrés dans React : réutilisation de la logique d'état entre les composants, composants plus simples et plus lisibles.</p>",
        category: "React",
        categoryId: "1",
        image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=900",
        author: "Ayoub El Mansouri",
        authorId: 1,
        authorAvatar: "https://ui-avatars.com/api/?name=Ayoub+El+Mansouri&background=2458D8&color=fff",
        date: "05 Mai 2026",
        readTime: 8,
        likes: 234,
        comments: 2,
        featured: true,
    },
    {
        id: 2,
        title: "Pourquoi utiliser TypeScript avec React",
        description: "TypeScript aide à éviter les erreurs et rend le code plus propre.",
        content: "<p>TypeScript offre des fonctionnalités puissantes pour typer votre code JavaScript.</p>",
        category: "TypeScript",
        categoryId: "2",
        image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=900",
        author: "Sara Benali",
        authorId: 2,
        authorAvatar: "https://ui-avatars.com/api/?name=Sara+Benali&background=0F8F7B&color=fff",
        date: "04 Mai 2026",
        readTime: 12,
        likes: 189,
        comments: 1,
        featured: true,
    },
];

const normalizePost = (post: any): Post => ({
    id: Number(post.id),
    title: post.title || post.titre || "Article sans titre",
    description: post.description || post.contenue?.slice(0, 160) || "",
    content: post.content || post.contenue || "",
    category: post.category || post.categorie?.libelle || "Général",
    categoryId: post.categoryId || post.categorie?.id?.toString(),
    image: post.image || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=900",
    author: post.author || post.user?.nom || "Auteur",
    authorId: post.authorId || post.user?.id,
    authorAvatar: post.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author || "Auteur")}&background=2458D8&color=fff`,
    date: post.date || "Date inconnue",
    readTime: post.readTime || 6,
    likes: post.likes || post.vues || 0,
    comments: typeof post.comments === "number" ? post.comments : post.comments?.length || 0,
    featured: post.featured ?? true,
    canDelete: Boolean(post.canDelete),
});

const normalizeCategory = (category: any): Category => ({
    id: String(category.id),
    name: category.name || category.libelle || "Categorie",
    count: Number(category.count || 0),
    icon: category.icon || "📁",
    description: category.description || "",
});

const withAllCategory = (categories: Category[]) => {
    const total = categories.reduce((sum, category) => sum + (category.count || 0), 0);
    return [{ id: "all", name: "Tous", count: total, icon: "📚" }, ...categories];
};

export const getArticles = async (): Promise<Post[]> => {
    try {
        const data = await apiRequest<any[]>("/articles");
        return data.map(normalizePost);
    } catch (error) {
        console.warn("Backend indisponible, utilisation des articles mock :", error);
        return mockPosts;
    }
};

export const getArticleById = async (id: number): Promise<Post | null> => {
    try {
        const data = await apiRequest<any>(`/articles/${id}`);
        return normalizePost(data);
    } catch (error) {
        console.warn(`Backend indisponible pour l'article ${id}, fallback mock :`, error);
        return mockPosts.find((post) => post.id === id) || null;
    }
};

export const createArticle = (payload: ArticlePayload) =>
    apiRequest<Post>("/articles", { method: "POST", body: JSON.stringify(payload) });

export const updateArticle = (id: number, payload: ArticlePayload) =>
    apiRequest<Post>(`/articles/${id}`, { method: "PUT", body: JSON.stringify(payload) });

export const deleteArticle = (id: number) =>
    apiRequest<void>(`/articles/${id}`, { method: "DELETE" });

export const getArticleComments = async (articleId: number): Promise<CommentType[]> => {
    try {
        return await apiRequest<CommentType[]>(`/articles/${articleId}/comments`);
    } catch (error) {
        console.warn("Commentaires backend indisponibles :", error);
        return [];
    }
};

export const createComment = (articleId: number, text: string) =>
    apiRequest<CommentType>(`/articles/${articleId}/comments`, {
        method: "POST",
        body: JSON.stringify({ text }),
    });

export const deleteComment = (id: number) =>
    apiRequest<void>(`/comments/${id}`, { method: "DELETE" });

export const getCategories = async (): Promise<Category[]> => {
    try {
        const data = await apiRequest<any[]>("/categories");
        return withAllCategory(data.map(normalizeCategory));
    } catch (error) {
        console.warn("Categories backend indisponibles :", error);
        return withAllCategory([]);
    }
};

export const createCategory = (payload: { name: string; description?: string; icon?: string }) =>
    apiRequest<Category>("/categories", { method: "POST", body: JSON.stringify(payload) });

export const updateCategory = (id: string, payload: { name?: string; description?: string; icon?: string }) =>
    apiRequest<Category>(`/categories/${id}`, { method: "PUT", body: JSON.stringify(payload) });

export const deleteCategory = (id: string) =>
    apiRequest<void>(`/categories/${id}`, { method: "DELETE" });

export const getUsers = () => apiRequest<ApiUser[]>("/admin/users");

export const deleteUser = (id: number) =>
    apiRequest<void>(`/admin/users/${id}`, { method: "DELETE" });
