import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

// Conteúdo perene: os artigos não têm data. A ordem na listagem vem do campo "ordem" (menor primeiro).
const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string().max(60),
    description: z.string().max(155),
    ordem: z.number().int().default(99),
    tags: z.array(z.string()).default([]),
    imagem: z.string().optional(), // nome do arquivo em public/img/, sem extensão
    ogImage: z.string().optional(),
  }),
});

export const collections = { blog };
