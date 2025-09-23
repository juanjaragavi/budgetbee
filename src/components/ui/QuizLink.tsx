import { buildQuizUrl } from "@/lib/utils/utmUtils";

export interface QuizLinkProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  "aria-label"?: string;
  onClick?: () => void;
}

/**
 * QuizLink component that dynamically generates quiz URLs with appropriate UTM parameters
 * Only includes UTM parameters when they are available from actual campaign sources
 */
export default function QuizLink({
  children,
  className,
  style,
  id,
  "aria-label": ariaLabel,
  onClick,
}: QuizLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    // Call optional onClick handler
    if (onClick) {
      onClick();
    }

    // Generate dynamic quiz URL
    const quizUrl = buildQuizUrl();

    // Navigate to quiz with proper UTM parameters (or clean URL if no UTMs)
    window.location.href = quizUrl;
  };

  return (
    <a
      href="/quiz"
      className={className}
      style={style}
      id={id}
      aria-label={ariaLabel}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
