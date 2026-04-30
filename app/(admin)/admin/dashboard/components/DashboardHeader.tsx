export function DashboardHeader() {
  return (
    <header className="mb-8 space-y-2">
      <h1 className="text-balance text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
        Admin{" "}
        <span className="bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
          dashboard
        </span>
      </h1>
      <p className="text-neutral-600">
        Applications, classes, attendance, and communications.
      </p>
    </header>
  );
}
