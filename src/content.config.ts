import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

// Homepage collection schema
const homepageCollection = defineCollection({
  loader: glob({ pattern: "**/-*.{md,mdx}", base: "src/content/homepage" }),
  schema: z.object({
    banner: z
      .object({
        title: z.string().optional(),
        content: z.string().optional(),
        image: z.string().optional(),
        button: z
          .object({
            label: z.string(),
            link: z.string().default("/contact"),
            enable: z.boolean().default(true),
          })
          .optional(),
      })
      .optional(),
    feature: z.object({
      title: z.string(),
      features: z.array(
        z.object({
          name: z.string(),
          icon: z.string().optional(),
          content: z.string().optional(),
        }),
      ),
    }),
    services: z
      .array(
        z.object({
          title: z.string().optional(),
          content: z.string().optional(),
          images: z.array(z.string()).optional(),
          button: z
            .object({
              label: z.string(),
              link: z.string().default("/contact"),
              enable: z.boolean().default(true),
            })
            .optional(),
        }),
      )
      .optional(),
    workflow: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
        image: z.string(),
      })
      .optional(),
    call_to_action: z
      .object({
        title: z.string().optional(),
        content: z.string().optional(),
        image: z.string(),
        button: z
          .object({
            label: z.string(),
            link: z.string().default("/contact"),
            enable: z.boolean().default(true),
          })
          .optional(),
      })
      .optional(),
  }),
});

//Contact collection schema
const contactCollection = defineCollection({
  loader: glob({ pattern: "**/-*.{md,mdx}", base: "src/content/contact" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    draft: z.boolean(),
    info: z.object({
      title: z.string(),
      description: z.string(),
      contacts: z.array(z.string()),
    }),
  }),
});

// Blog collection schema
const blogCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/blog" }),
  schema: z.object({
    title: z.string(),
    meta_title: z.string().optional(),
    description: z.string().optional(),
    date: z.date().optional(),
    image: z.string().optional(),
    authors: z.array(z.string()).default(["admin"]),
    categories: z.array(z.string()).default(["others"]),
    tags: z.array(z.string()).default(["others"]),
    draft: z.boolean().optional(),
  }),
});

// Personal Finance collection schema
const personalFinanceCollection = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "src/content/personal-finance",
  }),
  schema: z.object({
    title: z.string(),
    meta_title: z.string().optional(),
    description: z.string().optional(),
    date: z.date().optional(),
    image: z.string().optional(),
    authors: z.array(z.string()).default(["admin"]),
    categories: z.array(z.string()).default(["others"]),
    tags: z.array(z.string()).default(["others"]),
    draft: z.boolean().optional(),
  }),
});

// Financial Solutions collection schema
const financialSolutionsCollection = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "src/content/financial-solutions",
  }),
  schema: z.object({
    title: z.string(),
    meta_title: z.string().optional(),
    description: z.string().optional(),
    date: z.date().optional(),
    image: z.string().optional(),
    authors: z.array(z.string()).default(["admin"]),
    categories: z.array(z.string()).default(["others"]),
    tags: z.array(z.string()).default(["others"]),
    draft: z.boolean().optional(),
    color: z.string().optional(),
  }),
});

// Pages collection schema
const pagesCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    meta_title: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    layout: z.string().optional(),
    draft: z.boolean().optional(),
  }),
});

// Export collections
export const collections = {
  homepage: homepageCollection,
  blog: blogCollection,
  "personal-finance": personalFinanceCollection,
  "financial-solutions": financialSolutionsCollection,
  pages: pagesCollection,
  contact: contactCollection,
};
