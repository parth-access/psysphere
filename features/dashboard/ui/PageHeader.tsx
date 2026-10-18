interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-serif text-[32px] font-semibold leading-tight text-ink-900">{title}</h1>
        {description && <p className="mt-1 text-[15px] text-ink-500">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
