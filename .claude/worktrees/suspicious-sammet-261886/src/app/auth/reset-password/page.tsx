import { Suspense } from "react";
import { ResetPasswordClient } from "./ResetPasswordClient";

export const metadata = { title: "Şifre Sıfırla - Galaksi Motor" };

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordClient />
    </Suspense>
  );
}
