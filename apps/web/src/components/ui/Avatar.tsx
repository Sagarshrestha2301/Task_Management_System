import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex shrink-0 overflow-hidden rounded-full",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Avatar.displayName = "Avatar";

export interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

export const AvatarImage = forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, ...props }, ref) => {
    return (
      <img
        ref={ref}
        className={cn("aspect-square h-full w-full object-cover", className)}
        {...props}
      />
    );
  },
);

AvatarImage.displayName = "AvatarImage";

export interface AvatarFallbackProps extends HTMLAttributes<HTMLDivElement> {}

export const AvatarFallback = forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex h-full w-full items-center justify-center rounded-full bg-accent-soft text-accent font-medium",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

AvatarFallback.displayName = "AvatarFallback";
