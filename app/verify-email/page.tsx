"use client";
import { Suspense } from "react";
import VerifyEmailPage from "./verify-email-client";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <VerifyEmailPage />
    </Suspense>
  );
}
