import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export function RegistrationCard({ children }: { children: React.ReactNode }) {
  return (
    <Card className="w-full max-w-4xl shadow-2xl border-red-100">
      <CardHeader className="text-center bg-gradient-to-r from-red-600 to-red-400 text-white rounded-t-lg py-6">
        <CardTitle className="text-3xl font-bold">
          Chithi FET College Student Registration
        </CardTitle>
        <CardDescription className="text-red-100">
          Official Registration Portal
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-8">{children}</CardContent>
    </Card>
  );
}
