---
/**
 * INTEGRATION GUIDE: Enhanced Blog Post System
 * Step-by-step guide to implement the enhanced blog post components
 */
---

# Enhanced Blog Post System Integration Guide

## Overview

This guide shows how to integrate the enhanced blog post system into your existing BudgetBee AstroJS project. The system provides:

- ✅ **Enhanced Blog Manager** (`/src/lib/blogManager.ts`) - Advanced filtering, search, caching
- ✅ **Enhanced Post Card** (`/src/layouts/partials/PostCardEnhanced.astro`) - Modern card with variants
- ✅ **Enhanced Container** (`/src/layouts/components/BlogPostsContainerEnhanced.astro`) - Full-featured listing

## Quick Start

### 1. Update Homepage (`src/pages/index.astro`)

```astro
---
import { blogManager } from "@/lib/blogManager";
import PostCardEnhanced from "@/layouts/partials/PostCardEnhanced.astro";

// Replace existing post fetching
const { latest, featured, featuredPosts } =
  await blogManager.getHomepagePosts();
---

<!-- Replace existing Latest News section -->
<section class="latest-news py-16">
  <div class="container">
    <h2 class="text-3xl font-bold mb-8">Latest News</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      {
        latest.map((post, index) => (
          <PostCardEnhanced
            post={post}
            variant="default"
            animationDelay={index * 150}
            showExcerpt={true}
            showReadingTime={true}
            showCategories={true}
          />
        ))
      }
    </div>
  </div>
</section>

<!-- Replace existing Featured Article section -->
<section class="featured-article py-16">
  <div class="container">
    <h2 class="text-3xl font-bold mb-8">Featured Article</h2>
    <PostCardEnhanced
      post={featured}
      variant="featured"
      showExcerpt={true}
      showReadingTime={true}
      showCategories={true}
    />
  </div>
</section>
```

### 2. Update Blog Index (`src/pages/blog/index.astro`)

```astro
---
import { blogManager } from "@/lib/blogManager";
import BlogPostsContainerEnhanced from "@/layouts/components/BlogPostsContainerEnhanced.astro";

const allPosts = await blogManager.getAllPosts();
const postsPerPage = 12;
const totalPages = Math.ceil(allPosts.length / postsPerPage);
const currentPagePosts = allPosts.slice(0, postsPerPage);
---

<Base title="Blog">
  <div class="container py-16">
    <BlogPostsContainerEnhanced
      posts={currentPagePosts}
      currentPage={1}
      totalPages={totalPages}
      basePath="/blog"
      showFilters={true}
      showSearch={true}
      showSorting={true}
      gridCols={3}
      variant="default"
      title="All Blog Posts"
      description="Explore our comprehensive collection of financial advice"
      postsPerPage={postsPerPage}
    />
  </div>
</Base>
```

### 3. Update Category Pages (`src/pages/personal-finance/index.astro`)

```astro
---
import { blogManager } from "@/lib/blogManager";
import BlogPostsContainerEnhanced from "@/layouts/components/BlogPostsContainerEnhanced.astro";

const categoryPosts = await blogManager.getFilteredPosts({
  collection: "personal-finance",
  limit: 12,
});
---

<Base title="Personal Finance">
  <div class="container py-16">
    <BlogPostsContainerEnhanced
      posts={categoryPosts}
      showFilters={true}
      showSearch={true}
      showSorting={true}
      gridCols={2}
      variant="card"
      title="Personal Finance Articles"
      description="Master your personal finances with expert tips"
    />
  </div>
</Base>
```

### 4. Update Pagination Pages (`src/pages/blog/page/[slug].astro`)

```astro
---
import { blogManager } from "@/lib/blogManager";
import BlogPostsContainerEnhanced from "@/layouts/components/BlogPostsContainerEnhanced.astro";

export async function getStaticPaths() {
  const allPosts = await blogManager.getAllPosts();
  const postsPerPage = 12;
  const totalPages = Math.ceil(allPosts.length / postsPerPage);

  return Array.from({ length: totalPages }, (_, i) => ({
    params: { slug: (i + 1).toString() },
    props: {
      posts: allPosts.slice(i * postsPerPage, (i + 1) * postsPerPage),
      currentPage: i + 1,
      totalPages,
    },
  }));
}

const { posts, currentPage, totalPages } = Astro.props;
---

<Base title={`Blog - Page ${currentPage}`}>
  <div class="container py-16">
    <BlogPostsContainerEnhanced
      posts={posts}
      currentPage={currentPage}
      totalPages={totalPages}
      basePath="/blog"
      showFilters={true}
      showSearch={true}
      showSorting={true}
      gridCols={3}
      variant="default"
    />
  </div>
</Base>
```

### 5. Add Related Posts to Blog Post Pages (`src/layouts/PostSingle.astro`)

```astro
---
// Add this to your existing PostSingle.astro imports
import { blogManager } from "@/lib/blogManager";
import PostCardEnhanced from "@/layouts/partials/PostCardEnhanced.astro";

// Add this after your existing frontmatter
const relatedPosts = await blogManager.getRelatedPosts(post, 3);
---

<!-- Add this section after your main post content -->{
  relatedPosts.length > 0 && (
    <section class="related-posts py-16 border-t border-border dark:border-darkmode-border">
      <div class="container">
        <h2 class="text-2xl font-bold mb-8">Related Articles</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          {relatedPosts.map((relatedPost, index) => (
            <PostCardEnhanced
              post={relatedPost}
              variant="compact"
              showExcerpt={true}
              showReadingTime={true}
              showCategories={true}
              animationDelay={index * 100}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
```

## Advanced Features

### Search Functionality

Create a search page (`src/pages/search.astro`):

```astro
---
import { blogManager } from "@/lib/blogManager";
import BlogPostsContainerEnhanced from "@/layouts/components/BlogPostsContainerEnhanced.astro";

const searchQuery = Astro.url.searchParams.get("q") || "";
const searchResults = searchQuery
  ? await blogManager.getFilteredPosts({
      searchQuery,
      limit: 20,
    })
  : [];
---

<Base title={`Search${searchQuery ? ` - ${searchQuery}` : ""}`}>
  <div class="container py-16">
    <h1 class="text-4xl font-bold mb-8">
      Search Results {searchQuery && `for "${searchQuery}"`}
    </h1>

    {
      searchResults.length > 0 ? (
        <BlogPostsContainerEnhanced
          posts={searchResults}
          showFilters={false}
          showSearch={true}
          showSorting={true}
          gridCols={2}
          variant="compact"
        />
      ) : searchQuery ? (
        <div class="text-center py-12">
          <p class="text-lg text-gray-600">
            No posts found. Try a different search term.
          </p>
        </div>
      ) : (
        <div class="text-center py-12">
          <p class="text-lg text-gray-600">
            Enter a search term to find posts.
          </p>
        </div>
      )
    }
  </div>
</Base>
```

### Analytics Integration

Add analytics tracking (`src/lib/analytics.ts`):

```typescript
import { blogManager } from "./blogManager";

export async function trackBlogMetrics() {
  const metrics = await blogManager.getBlogMetrics();

  // Send to your analytics service
  console.log("Blog Metrics:", metrics);

  return metrics;
}

export function trackPostView(postId: string) {
  // Track individual post views
  if (typeof window !== "undefined") {
    // Your analytics tracking code
    console.log("Post viewed:", postId);
  }
}
```

### Performance Optimization

Add to your Astro config (`astro.config.mjs`):

```javascript
export default defineConfig({
  // Enable view transitions for smooth navigation
  experimental: {
    viewTransitions: true,
  },

  // Optimize images
  image: {
    domains: ["yourdomain.com"],
    formats: ["webp", "avif"],
  },

  // Enable prefetching
  prefetch: {
    prefetchAll: true,
  },
});
```

## Migration Checklist

- [ ] Install new blog manager: Copy `blogManager.ts` to `src/lib/`
- [ ] Add enhanced components: Copy `PostCardEnhanced.astro` and `BlogPostsContainerEnhanced.astro`
- [ ] Update homepage: Replace existing post sections
- [ ] Update blog index: Replace with enhanced container
- [ ] Update category pages: Add filtering and search
- [ ] Update pagination: Use enhanced system
- [ ] Add related posts: Update post single layout
- [ ] Test search functionality: Create search page
- [ ] Verify performance: Check loading times and animations
- [ ] Test accessibility: Verify keyboard navigation and screen reader support

## Compatibility Notes

The enhanced system is designed to be **fully compatible** with your existing:

- ✅ Content collections structure
- ✅ Frontmatter schema
- ✅ Existing styling and theme
- ✅ URL structure and routing
- ✅ SEO configuration

## Next Steps

1. **Start with Homepage**: Implement enhanced cards on homepage first
2. **Add Search**: Create search page for immediate user value
3. **Enhance Blog Index**: Replace existing blog listing with enhanced container
4. **Add Related Posts**: Improve user engagement with related content
5. **Monitor Performance**: Track loading times and user interactions

The enhanced system provides immediate improvements while maintaining full backward compatibility with your existing content and structure.
