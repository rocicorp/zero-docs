import TocClient from './toc-client';
import {getDocsTocs} from '@/lib/markdown';

export default async function Toc({path}: {path: string}) {
  const tocs = await getDocsTocs(path);

  return <TocClient tocs={tocs} />;
}
