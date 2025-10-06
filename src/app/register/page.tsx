import { RegisterForm } from "@/components/register-form";

import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white via-white to-slate-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20">
        <RegisterForm className="mx-auto max-w-md" />
      </div>
    </div>
  );
}
