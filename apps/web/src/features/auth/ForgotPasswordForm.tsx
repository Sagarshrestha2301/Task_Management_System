import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, RotateCcw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { useForgotPassword } from "@/hooks/useAuth";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const navigate = useNavigate();
  const forgotPasswordMutation = useForgotPassword();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setError(null);
    try {
      await forgotPasswordMutation.mutateAsync(data);
      setIsSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send reset link",
      );
    }
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <RotateCcw className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <h1 className="text-2xl font-semibold text-text">Check your email</h1>
          <p className="text-text-muted mt-1">
            If an account exists, a reset link has been sent
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-text-muted">
            <Link
              to="/login"
              className="text-accent hover:underline font-medium"
            >
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <h1 className="text-2xl font-semibold text-text">Forgot password</h1>
        <p className="text-text-muted mt-1">
          Enter your email to reset your password
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            error={errors.email?.message}
            icon={<Mail className="h-4 w-4" />}
            disabled={forgotPasswordMutation.isPending}
            required
          />

          <Button
            className="w-full"
            type="submit"
            loading={forgotPasswordMutation.isPending}
          >
            Send reset link
          </Button>
        </form>

        <div className="text-center text-sm text-text-muted">
          <Link to="/login" className="text-accent hover:underline">
            Back to sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
