// app/register/components/ProgressBar.tsx
export function ProgressBar({
  steps,
  currentStep,
}: {
  steps: string[];
  currentStep: number;
}) {
  return (
    <div className="hidden lg:flex flex-wrap justify-between mb-10 text-sm gap-2">
      {steps.map((label, i) => (
        <div
          key={i}
          className={`flex-1 min-w-20 text-center font-medium ${
            currentStep >= i + 1 ? "text-red-600 underline" : "text-gray-400"
          }`}
        >
          {label}
        </div>
      ))}
    </div>
  );
}
