import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export function RegistrationCard({ children }: { children: React.ReactNode }) {
  return (
    <Card className="w-full max-w-4xl overflow-hidden rounded-2xl border border-red-100/90 bg-white/85 shadow-lg shadow-red-950/5 ring-1 ring-red-50/80 backdrop-blur-sm">
      <CardHeader className="rounded-t-2xl bg-gradient-to-r from-red-600 to-red-500 py-8 text-center text-white">
        <CardTitle className="text-2xl font-bold sm:text-3xl">
          Chithi FET College Student Registration
        </CardTitle>
        <CardDescription className="text-red-100">
          Official registration portal
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-8">{children}</CardContent>
    </Card>
  );
}
