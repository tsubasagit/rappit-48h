import { MockupPreview } from './MockupPreview';

interface MockupGalleryProps {
  urls: string[];
  titles?: string[];
}

export function MockupGallery({ urls, titles }: MockupGalleryProps) {
  if (urls.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-gray-300 py-12">
        <p className="text-sm text-gray-400">モックアップはまだありません</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {urls.map((url, index) => (
        <MockupPreview
          key={url}
          url={url}
          title={titles?.[index]}
        />
      ))}
    </div>
  );
}
