// app/register/components/Section.tsx
export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-red-700 mb-6 border-b border-red-200 pb-2">
        {title}
      </h2>
      {children}
    </div>
  );
}
