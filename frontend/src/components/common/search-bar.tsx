import * as React from "react";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input, type InputProps } from "@/components/ui/input";

export interface SearchBarProps extends Omit<InputProps, "type"> {
  containerClassName?: string;
}

const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  (
    { className, containerClassName, placeholder = "支出を検索", "aria-label": ariaLabel, ...props },
    ref
  ) => {
    return (
      <div className={cn("relative w-full", containerClassName)}>
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={ref}
          type="search"
          placeholder={placeholder}
          // placeholder はフォーカス時に消え、一部のスクリーンリーダーでは
          // ラベル代わりとして安定して読み上げられないため aria-label を明示する
          aria-label={ariaLabel ?? placeholder}
          className={cn("rounded-full pl-11", className)}
          {...props}
        />
      </div>
    );
  }
);
SearchBar.displayName = "SearchBar";

export { SearchBar };
