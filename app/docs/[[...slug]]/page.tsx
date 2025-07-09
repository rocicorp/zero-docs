import Toc from '@/components/toc';
import Pagination from '@/components/Pagination';
import {page_routes} from '@/lib/routes-config';
import {notFound} from 'next/navigation';
import {getDocsForSlug, getDocsTocs, getPreviousNext} from '@/lib/markdown';
import {Typography} from '@/components/typography';
import CopyContent from '@/components/ui/copy-content';

type PageProps = {params: {slug: string[]}};

export default async function DocsPage({params: {slug = []}}: PageProps) {
  const pathName = slug.join('/');
  const [res, tocs, previousNext] = await Promise.all([
    getDocsForSlug(pathName),
    getDocsTocs(pathName),
    getPreviousNext(pathName),
  ]);

  if (!res) notFound();

  return (
    <div className="flex items-start gap-14">
      <div className="flex-[3] py-10">
        <Typography>
          <h1 className="text-3xl -mt-2">{res.frontmatter.title}</h1>
          <p className="-mt-4 text-muted-foreground text-[16.5px]">
            {res.frontmatter.description}
          </p>
          {/* Wrap content with CopyableContent */}
          <CopyContent content={res.content} />
          <Pagination previousNext={previousNext} />
        </Typography>
      </div>
      <Toc tocs={tocs} />
    </div>
  );
}

export async function generateMetadata({params: {slug = []}}: PageProps) {
  const pathName = slug.join('/');
  const res = await getDocsForSlug(pathName);
  if (!res) return null;
  const {frontmatter} = res;
  return {title: frontmatter.title, description: frontmatter.description};
}

export function generateStaticParams() {
  return page_routes.map(item => ({slug: item.href.split('/').slice(1)}));
}
