import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface TableProps extends HTMLAttributes<HTMLTableElement> {}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="overflow-x-auto">
        <table
          ref={ref}
          className={cn("w-full caption-bottom text-sm", className)}
          {...props}
        >
          {children}
        </table>
      </div>
    );
  },
);

Table.displayName = "Table";

export interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {}

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  TableHeaderProps
>(({ className, children, ...props }, ref) => {
  return (
    <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props}>
      {children}
    </thead>
  );
});

TableHeader.displayName = "TableHeader";

export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {}

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <tbody
        ref={ref}
        className={cn("[&_tr:last-child]:border-0", className)}
        {...props}
      >
        {children}
      </tbody>
    );
  },
);

TableBody.displayName = "TableBody";

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={cn(
          "border-b border-border transition-colors hover:bg-surface-muted/50 data-[state=selected]:bg-accent-soft",
          className,
        )}
        {...props}
      />
    );
  },
);

TableRow.displayName = "TableRow";

export interface TableHeadProps extends HTMLAttributes<HTMLTableCellElement> {}

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={cn(
          "h-10 px-3 text-left align-middle font-medium text-text-muted [&:has([role=checkbox])]:pr-0",
          className,
        )}
        {...props}
      />
    );
  },
);

TableHead.displayName = "TableHead";

export interface TableCellProps extends HTMLAttributes<HTMLTableCellElement> {}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={cn(
          "p-3 align-middle [&:has([role=checkbox])]:pr-0",
          className,
        )}
        {...props}
      />
    );
  },
);

TableCell.displayName = "TableCell";

export interface TableCaptionProps extends HTMLAttributes<HTMLTableCaptionElement> {}

export const TableCaption = forwardRef<
  HTMLTableCaptionElement,
  TableCaptionProps
>(({ className, ...props }, ref) => {
  return (
    <caption
      ref={ref}
      className={cn("mt-4 text-sm text-text-muted", className)}
      {...props}
    />
  );
});

TableCaption.displayName = "TableCaption";
