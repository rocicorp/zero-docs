import CopyButtonListener from './copy-button-listener';

export default function CopyContent({content}: {content: React.ReactNode}) {
  return (
    <>
      <CopyButtonListener />
      {content}
    </>
  );
}
