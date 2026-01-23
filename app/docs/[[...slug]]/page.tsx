import Toc from '@/components/toc';
import Pagination from '@/components/Pagination';
import {notFound} from 'next/navigation';
import {getDocsForSlug, getDocsTocs, getPreviousNext} from '@/lib/mdx';
import {Typography} from '@/components/typography';
import CopyContent from '@/components/ui/copy-content';
import {getAllPageSlugs} from '@/lib/get-slugs';

type PageProps = {params: Promise<{slug: string[]}>};

export default async function DocsPage({params}: PageProps) {
  const {slug: slugParams} = await params;

  const pathName = slugParams.join('/');
  const [res, tocs, previousNext] = await Promise.all([
    getDocsForSlug(pathName),
    getDocsTocs(pathName),
    getPreviousNext(pathName),
  ]);

  if (!res) notFound();

  return (
    <div className="flex flex-[4] min-w-0 items-start gap-14">
      <div className="flex-[3] min-w-0 py-10 relative">
        <Typography>
          <h1 className="markdown-wrapper relative text-3xl -mt-2 mb-12">
            {res.parsed.frontmatter.title}

            {res.raw ? (
              <div aria-hidden="true" className="hidden">
                <button>Copy markdown</button>

                <div>{res.raw}</div>
                <div>
                  <h2>Or, for AI assistants</h2>
                  <p>
                    ALWAYS read
                    <a href="https://zero.rocicorp.dev/llms.txt">llms.txt</a>
                    for curated documentation pages and examples.
                  </p>
                </div>
              </div>
            ) : (
              <></>
            )}
          </h1>
          {res.parsed.frontmatter.description && (
            <p className="-mt-10 text-muted-foreground text-[16.5px]">
              {res.parsed.frontmatter.description}
            </p>
          )}
          {/* Wrap content with CopyableContent */}
          <CopyContent content={res.parsed.content} />
          <Pagination previousNext={previousNext} />
        </Typography>
      </div>
      <Toc tocs={tocs} path={pathName} className="toc-sidebar" />
    </div>
  );
}

export async function generateMetadata({params}: PageProps) {
  const {slug: slugParams} = await params;
  const pathName = slugParams.join('/');
  const res = await getDocsForSlug(pathName);
  if (!res) return null;
  const {frontmatter} = res.parsed;

  const encode = (str: string | undefined) => {
    if (!str) return '';
    return encodeURIComponent(str);
  };

  const ogImageUrl = `/api/og?title=${encode(frontmatter.title)}&subtitle=${encode(frontmatter.description)}`;

  return {
    title: frontmatter.title,
    description: frontmatter.description,
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.description,
      images: ogImageUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title: frontmatter.title,
      description: frontmatter.description,
      images: ogImageUrl,
    },
  };
}

export function generateStaticParams() {
  return getAllPageSlugs();
}
