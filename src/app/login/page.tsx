import { LoginForm } from "@/components/login-form"

import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }
  
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white via-white to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  )
}
