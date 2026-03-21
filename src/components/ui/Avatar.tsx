type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: AvatarSize;
}

const sizeMap: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function Avatar({ src, name, size = 'md' }: AvatarProps) {
  const sizeClass = sizeMap[size];

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? 'ユーザーアバター'}
        className={`rounded-full object-cover ${sizeClass}`}
      />
    );
  }

  const initials = name ? getInitials(name) : '?';

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-rabit-200 font-medium text-rabit-700 ${sizeClass}`}
      aria-label={name ?? 'ユーザーアバター'}
    >
      {initials}
    </div>
  );
}
