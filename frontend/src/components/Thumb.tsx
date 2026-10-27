interface ThumbProps {
  src: string | null;
  alt: string;
  className?: string;
  stripes?: 'default' | 'light' | 'accent';
  eager?: boolean;
}

const stripeClasses = {
  default: 'stripes',
  light: 'stripes-light',
  accent: 'stripes-accent',
};

// Image box with the striped placeholder when there is no picture.
// A plain <img> because imported posts point at many external hosts
// that next/image would reject unless each one is configured.
export default function Thumb({ src, alt, className = '', stripes = 'default', eager = false }: ThumbProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className={`absolute inset-0 ${stripeClasses[stripes]}`} aria-hidden="true" />
      )}
    </div>
  );
}
