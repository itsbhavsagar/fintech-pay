import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AuthSubmitButtonProps = ButtonProps & {
  loading?: boolean;
  loadingLabel?: string;
};

export function AuthSubmitButton({
  loading = false,
  loadingLabel = "Signing in",
  children,
  className,
  disabled,
  ...props
}: AuthSubmitButtonProps) {
  return (
    <Button
      className={cn(
        "w-full h-12 rounded-full bg-primary text-primary-foreground text-base font-semibold transition-all hover:opacity-90",
        loading && "opacity-90",
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          {loadingLabel}
          <span className="auth-submit-dots inline-flex items-center gap-1" aria-hidden>
            <span className="size-1 rounded-full bg-primary-foreground" />
            <span className="size-1 rounded-full bg-primary-foreground" />
            <span className="size-1 rounded-full bg-primary-foreground" />
          </span>
        </span>
      ) : (
        children
      )}
    </Button>
  );
}
