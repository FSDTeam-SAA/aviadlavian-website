import React, { Suspense } from "react";
import ResetPasswordForm from "@/features/auth/reset-password/components/reset-password-form";

const page = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
};

export default page;
