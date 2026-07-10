import * as React from 'react';
import { cn } from '@/lib/utils';

export const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, id, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table
        id={id}
        ref={ref}
        className={cn('w-full caption-bottom text-sm border-collapse text-left', className)}
        {...props}
      />
    </div>
  )
);
Table.displayName = 'Table';

export const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, id, ...props }, ref) => (
    <thead id={id} ref={ref} className={cn('bg-brand-cream/50 border-b border-brand-stone-soft/60', className)} {...props} />
  )
);
TableHeader.displayName = 'TableHeader';

export const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, id, ...props }, ref) => (
    <tbody id={id} ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
  )
);
TableBody.displayName = 'TableBody';

export const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, id, ...props }, ref) => (
    <tr
      id={id}
      ref={ref}
      className={cn(
        'border-b border-brand-stone-soft/30 transition-colors hover:bg-brand-cream/30 data-[state=selected]:bg-brand-beige',
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = 'TableRow';

export const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, id, ...props }, ref) => (
    <th
      id={id}
      ref={ref}
      className={cn(
        'h-10 px-4 text-xs font-sans font-semibold text-brand-charcoal-muted uppercase tracking-wider align-middle [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  )
);
TableHead.displayName = 'TableHead';

export const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, id, ...props }, ref) => (
    <td
      id={id}
      ref={ref}
      className={cn('p-4 align-middle font-sans text-sm text-brand-charcoal [&:has([role=checkbox])]:pr-0', className)}
      {...props}
    />
  )
);
TableCell.displayName = 'TableCell';
