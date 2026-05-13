"use client";

import { useSearchParams } from "next/navigation";
import VerifyCode from "@/components/screens/verify-code";

export default function VerifyCodePage() {
  const params = useSearchParams();
  const email = params?.get("email") || "";
  const challengeId = params?.get("challengeId") || "";

  return <VerifyCode email={email} challengeId={challengeId} />;
}
