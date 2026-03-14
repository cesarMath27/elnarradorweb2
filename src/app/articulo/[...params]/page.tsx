import { getNewsById, getLatestNews } from "@/lib/supabase/queries";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import CategoryBadge from "@/components/news/CategoryBadge";
import ShareButtons from "./ShareButtons";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { notFound } from "next/navigation";
import { slugify, getArticleUrl } from "@/lib/utils/slug";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://elnarradordemexico.com";

export const revalidate = 300;

type Props = {
  params: Promise<{ params: string[] }>;
};

export async function generateMetadata({ params }: Props) {
  const { params: segments } = await params;
  const id = segments[0];
  try {
    const article = await getNewsById(id);
    const canonicalUrl = `${SITE_URL}${getArticleUrl(article)}`;
    return {
      title: `${article.title} - El Narrador de México`,
      description: article.summary || article.title,
      openGraph: {
        title: article.title,
        description: article.summary || article.title,
        url: canonicalUrl,
        siteName: "El Narrador de México",
        locale: "es_MX",
        type: "article",
        publishedTime: article.published_at,
        authors: [article.author_name],
        section: article.category_name,
        tags: article.tags,
        images: article.image_url
          ? [
              {
                url: article.image_url,
                width: 1200,
                height: 630,
                alt: article.title,
              },
            ]
          : [
              {
                url: `${SITE_URL}/images/banner-narrador.jpg`,
                width: 1200,
                height: 630,
                alt: "El Narrador de México",
              },
            ],
      },
      twitter: {
        card: "summary_large_image",
        site: "@elnarradormx",
        title: article.title,
        description: article.summary || article.title,
        images: article.image_url
          ? [article.image_url]
          : [`${SITE_URL}/images/banner-narrador.jpg`],
      },
      alternates: {
        canonical: canonicalUrl,
      },
    };
  } catch {
    return {};
  }
}

export default async function ArticlePage({ params }: Props) {
  const { params: segments } = await params;
  const id = segments[0];
  const urlSlug = segments.slice(1).join("/");

  let article;
  try {
    article = await getNewsById(id);
  } catch {
    notFound();
  }

  // Redirect to the canonical descriptive URL if slug is missing or wrong
  const expectedSlug = slugify(article.title);
  if (expectedSlug && urlSlug !== expectedSlug) {
    redirect(getArticleUrl(article));
  }

  const relatedNews = await getLatestNews(5);
  const related = relatedNews.filter((a) => a.id !== article.id).slice(0, 5);
  const canonicalUrl = `${SITE_URL}${getArticleUrl(article)}`;

  return (
    <>
      <ArticleJsonLd
        title={article.title}
        description={article.summary || article.title}
        image={article.image_url}
        datePublished={article.published_at}
        authorName={article.author_name}
        url={canonicalUrl}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: SITE_URL },
          ...(article.category_slug
            ? [
                {
                  name: article.category_name,
                  url: `${SITE_URL}/${article.category_slug}`,
                },
              ]
            : []),
          { name: article.title, url: canonicalUrl },
        ]}
      />
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Article content */}
        <article className="flex-1 min-w-0">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted mb-6" aria-label="Breadcrumb">
            <Link
              href="/"
              className="hover:text-gold transition-colors duration-200 cursor-pointer"
            >
              Inicio
            </Link>
            <span>/</span>
            {article.category_slug && (
              <>
                <Link
                  href={`/${article.category_slug}`}
                  className="hover:text-gold transition-colors duration-200 cursor-pointer"
                >
                  {article.category_name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-muted-light line-clamp-1">
              {article.title}
            </span>
          </nav>

          {/* Header */}
          <header className="mb-8">
            <CategoryBadge name={article.category_name} />
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4 leading-tight">
              {article.title}
            </h1>
            {article.summary && (
              <p className="text-lg text-muted leading-relaxed mb-4">
                {article.summary}
              </p>
            )}
            <div className="flex items-center justify-between flex-wrap gap-4 text-sm text-muted-light">
              <div className="flex items-center gap-4">
                <span className="font-medium text-foreground">
                  {article.author_name}
                </span>
                <time dateTime={article.published_at}>
                  {new Date(article.published_at).toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </div>
              <ShareButtons title={article.title} url={canonicalUrl} />
            </div>
          </header>

          {/* Featured image */}
          {article.image_url && (
            <div className="relative aspect-video rounded-lg overflow-hidden mb-8">
              <Image
                src={article.image_url}
                alt={article.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
                priority
              />
            </div>
          )}

          {/* Article body */}
          <div
            className="article-content text-foreground leading-relaxed text-lg"
            dangerouslySetInnerHTML={{ __html: article.content || "" }}
          />

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-border">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted font-medium">
                  Etiquetas:
                </span>
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-sm bg-background text-muted px-3 py-1 rounded-full border border-border"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Source link */}
          {article.source_url && (
            <div className="mt-4">
              <a
                href={article.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gold hover:text-gold-dark transition-colors duration-200 cursor-pointer"
              >
                Ver fuente original
              </a>
            </div>
          )}
        </article>

        {/* Sidebar */}
        <div className="w-full lg:w-80 shrink-0">
          <Sidebar title="Noticias Recientes" articles={related} />
        </div>
      </div>
    </div>
    </>
  );
}
