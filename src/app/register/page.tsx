import { RegisterForm } from "@/components/register-form";

import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-start px-4 md:px-8 pt-2 md:pt-8 pb-0">
      <div className="w-full max-w-sm md:max-w-3xl">
        <RegisterForm />
      </div>
    </div>
  );
}
