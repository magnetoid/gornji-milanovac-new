'use client';

interface CopyLinkButtonProps {
  url: string;
  className?: string;
  children: React.ReactNode;
}

export default function CopyLinkButton({ url, className, children }: CopyLinkButtonProps) {
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard?.writeText(url)}
      className={className}
      aria-label="Kopiraj link"
    >
      {children}
    </button>
  );
}
