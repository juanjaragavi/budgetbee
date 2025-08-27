/**
 * Enhanced Blog Post Manager
 * Modern utility for managing blog posts with advanced filtering, search, and caching
 */

import { getCollection, type CollectionEntry } from "astro:content";
import { sortByDate } from "@/lib/utils/sortFunctions";

export type BlogPost = CollectionEntry<
  "personal-finance" | "financial-solutions"
>;
export type BlogCollection = "personal-finance" | "financial-solutions" | "all";

export interface BlogPostFilters {
  category?: string[];
  tags?: string[];
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  searchQuery?: string;
  collection?: BlogCollection;
  limit?: number;
  offset?: number;
}

export interface BlogPostMetrics {
  totalPosts: number;
  postsByCategory: Record<string, number>;
  postsByMonth: Record<string, number>;
  averageReadTime: number;
}

class BlogManager {
  private static instance: BlogManager;
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): BlogManager {
    if (!BlogManager.instance) {
      BlogManager.instance = new BlogManager();
    }
    return BlogManager.instance;
  }

  /**
   * Get cached data or fetch fresh data
   */
  private async getCachedData<T>(
    key: string,
    fetcher: () => Promise<T>,
  ): Promise<T> {
    const now = Date.now();
    const expiry = this.cacheExpiry.get(key);

    if (this.cache.has(key) && expiry && now < expiry) {
      return this.cache.get(key);
    }

    const data = await fetcher();
    this.cache.set(key, data);
    this.cacheExpiry.set(key, now + this.CACHE_DURATION);

    return data;
  }

  /**
   * Get all blog posts from specified collections
   */
  async getAllPosts(
    collections: BlogCollection[] = ["personal-finance", "financial-solutions"],
  ): Promise<BlogPost[]> {
    const cacheKey = `all-posts-${collections.join("-")}`;

    return this.getCachedData(cacheKey, async () => {
      const allPosts: BlogPost[] = [];

      for (const collection of collections) {
        if (collection === "all") continue;

        try {
          const posts = await getCollection(collection);
          const publishedPosts = posts.filter((post) => {
            const pageData = post.data as any;
            return pageData.draft !== true;
          });
          allPosts.push(...publishedPosts);
        } catch (error) {
          console.warn(`Failed to fetch collection "${collection}":`, error);
        }
      }

      return sortByDate(allPosts);
    });
  }

  /**
   * Enhanced filtering with search capabilities
   */
  async getFilteredPosts(filters: BlogPostFilters = {}): Promise<BlogPost[]> {
    const cacheKey = `filtered-posts-${JSON.stringify(filters)}`;

    return this.getCachedData(cacheKey, async () => {
      let posts = await this.getAllPosts();

      // Collection filter
      if (filters.collection && filters.collection !== "all") {
        posts = posts.filter((post) => post.collection === filters.collection);
      }

      // Category filter
      if (filters.category && filters.category.length > 0) {
        posts = posts.filter((post) => {
          const postCategories = post.data.categories || [];
          return filters.category!.some((cat) =>
            postCategories.some((pc: string) =>
              pc.toLowerCase().includes(cat.toLowerCase()),
            ),
          );
        });
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        posts = posts.filter((post) => {
          const postTags = post.data.tags || [];
          return filters.tags!.some((tag) =>
            postTags.some((pt: string) =>
              pt.toLowerCase().includes(tag.toLowerCase()),
            ),
          );
        });
      }

      // Date range filter
      if (filters.dateRange) {
        posts = posts.filter((post) => {
          if (!post.data.date) return false;
          const postDate = new Date(post.data.date);
          const { start, end } = filters.dateRange!;

          if (start && postDate < start) return false;
          if (end && postDate > end) return false;

          return true;
        });
      }

      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        posts = posts.filter((post) => {
          const searchText = [
            post.data.title,
            post.data.description,
            post.body,
            ...(post.data.categories || []),
            ...(post.data.tags || []),
          ]
            .join(" ")
            .toLowerCase();

          return searchText.includes(query);
        });
      }

      // Pagination
      if (filters.offset || filters.limit) {
        const start = filters.offset || 0;
        const end = filters.limit ? start + filters.limit : undefined;
        posts = posts.slice(start, end);
      }

      return posts;
    });
  }

  /**
   * Get featured posts based on various criteria
   */
  async getFeaturedPosts(count: number = 3): Promise<BlogPost[]> {
    const posts = await this.getAllPosts();

    // Prioritize recent posts with higher engagement potential
    return posts
      .filter((post) => {
        // Featured posts should be high-quality and recent
        if (!post.data.date) return false;
        const age = Date.now() - new Date(post.data.date).getTime();
        const daysSincePublished = age / (1000 * 60 * 60 * 24);
        return daysSincePublished <= 90; // Posts from last 90 days
      })
      .slice(0, count);
  }

  /**
   * Get posts for homepage sections
   */
  async getHomepagePosts(): Promise<{
    latest: BlogPost[];
    featured: BlogPost;
    featuredPosts: BlogPost[];
  }> {
    const posts = await this.getAllPosts();

    return {
      latest: posts.slice(0, 3),
      featured: posts[0],
      featuredPosts: posts.slice(1, 4),
    };
  }

  /**
   * Get all unique categories across collections
   */
  async getAllCategories(): Promise<string[]> {
    const cacheKey = "all-categories";

    return this.getCachedData(cacheKey, async () => {
      const posts = await this.getAllPosts();
      const categories = new Set<string>();

      posts.forEach((post) => {
        const postCategories = post.data.categories || [];
        postCategories.forEach((category: string) => categories.add(category));
      });

      return Array.from(categories).sort();
    });
  }

  /**
   * Get all unique tags across collections
   */
  async getAllTags(): Promise<string[]> {
    const cacheKey = "all-tags";

    return this.getCachedData(cacheKey, async () => {
      const posts = await this.getAllPosts();
      const tags = new Set<string>();

      posts.forEach((post) => {
        const postTags = post.data.tags || [];
        postTags.forEach((tag: string) => tags.add(tag));
      });

      return Array.from(tags).sort();
    });
  }

  /**
   * Get related posts based on categories and tags
   */
  async getRelatedPosts(
    currentPost: BlogPost,
    count: number = 3,
  ): Promise<BlogPost[]> {
    const posts = await this.getAllPosts();
    const currentCategories = currentPost.data.categories || [];
    const currentTags = currentPost.data.tags || [];

    // Score posts based on category and tag overlap
    const scoredPosts = posts
      .filter((post) => post.id !== currentPost.id)
      .map((post) => {
        let score = 0;
        const postCategories = post.data.categories || [];
        const postTags = post.data.tags || [];

        // Category matches (higher weight)
        score +=
          postCategories.filter((cat: string) =>
            currentCategories.includes(cat),
          ).length * 3;

        // Tag matches
        score +=
          postTags.filter((tag: string) => currentTags.includes(tag)).length *
          1;

        return { post, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, count);

    return scoredPosts.map(({ post }) => post);
  }

  /**
   * Get blog metrics for analytics
   */
  async getBlogMetrics(): Promise<BlogPostMetrics> {
    const cacheKey = "blog-metrics";

    return this.getCachedData(cacheKey, async () => {
      const posts = await this.getAllPosts();

      const postsByCategory: Record<string, number> = {};
      const postsByMonth: Record<string, number> = {};
      let totalWords = 0;

      posts.forEach((post) => {
        // Categories
        const categories = post.data.categories || [];
        categories.forEach((category: string) => {
          postsByCategory[category] = (postsByCategory[category] || 0) + 1;
        });

        // Monthly distribution
        if (post.data.date) {
          const month = new Date(post.data.date).toISOString().slice(0, 7);
          postsByMonth[month] = (postsByMonth[month] || 0) + 1;
        }

        // Word count for reading time
        if (post.body) {
          const wordCount = post.body.split(/\s+/).length;
          totalWords += wordCount;
        }
      });

      const averageWordsPerPost =
        posts.length > 0 ? totalWords / posts.length : 0;
      const averageReadTime = Math.ceil(averageWordsPerPost / 200); // ~200 words per minute

      return {
        totalPosts: posts.length,
        postsByCategory,
        postsByMonth,
        averageReadTime,
      };
    });
  }

  /**
   * Clear cache (useful for development)
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  /**
   * Get estimated reading time for a post
   */
  getReadingTime(post: BlogPost): number {
    const wordsPerMinute = 200;
    if (!post.body) return 1;
    const wordCount = post.body.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  /**
   * Generate SEO-friendly excerpt
   */
  generateExcerpt(post: BlogPost, maxLength: number = 160): string {
    const description = post.data.description;
    if (description && description.length <= maxLength) {
      return description;
    }

    // Extract from body content
    if (!post.body) {
      return description || "No description available";
    }

    const cleanBody = post.body
      .replace(/#{1,6}\s/g, "") // Remove markdown headers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Replace links with text
      .replace(/[*_~`]/g, "") // Remove markdown formatting
      .trim();

    if (cleanBody.length <= maxLength) {
      return cleanBody;
    }

    // Truncate at word boundary
    const truncated = cleanBody.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(" ");

    return lastSpace > 0
      ? truncated.slice(0, lastSpace) + "..."
      : truncated + "...";
  }
}

// Export singleton instance
export const blogManager = BlogManager.getInstance();

// Export utility functions for direct use
export const {
  getAllPosts,
  getFilteredPosts,
  getFeaturedPosts,
  getHomepagePosts,
  getAllCategories,
  getAllTags,
  getRelatedPosts,
  getBlogMetrics,
  getReadingTime,
  generateExcerpt,
  clearCache,
} = blogManager;
