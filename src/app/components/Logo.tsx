import Link from 'next/link';

interface DiaryLogoProps {
  href?: string;
  className?: string;
  logoClassName?: string;
}

export default function DiaryLogo({
  href = '/home',
  className = 'fixed top-6 left-6 z-50',
  logoClassName = 'text-3xl font-serif italic text-pink-700 hover:text-pink-600 transition-colors',
}: DiaryLogoProps) {
  return (
    <div className={className}>
      <Link href={href} className={logoClassName}>
        Diary
      </Link>
    </div>
  );
}
