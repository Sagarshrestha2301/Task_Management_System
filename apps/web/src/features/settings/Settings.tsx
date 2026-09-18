import { useState } from "react";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useChangePassword } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/Feedback";

const profileSchema = z.object({
  displayName: z.string().trim().min(1, "Display name is required").max(80),
  email: z.string().email("Invalid email address"),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(12, "Password must be at least 12 characters")
      .max(128),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export function Settings() {
  const { user, logout } = useAuthContext();
  const changePasswordMutation = useChangePassword();
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: user?.name ?? "", email: user?.email ?? "" },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmitProfile = async (data: ProfileForm) => {
    // TODO: Implement profile update API call
    console.log("Update profile:", data);
  };

  const onSubmitPassword = async (data: ChangePasswordForm) => {
    setPasswordError(null);
    setPasswordSuccess(null);
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setPasswordSuccess(
        "Password changed successfully. Please sign in again.",
      );
      resetPassword();
      setTimeout(() => logout(), 2000);
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "Failed to change password",
      );
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold text-text">Settings</h1>

      <div className="flex gap-4 border-b border-border mb-6">
        <button
          onClick={() => setActiveTab("profile")}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === "profile"
              ? "border-accent text-accent"
              : "border-transparent text-text-muted hover:text-text",
          )}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === "security"
              ? "border-accent text-accent"
              : "border-transparent text-text-muted hover:text-text",
          )}
        >
          Security
        </button>
      </div>

      {activeTab === "profile" && (
        <Card>
          <CardHeader>
            <h3 className="font-medium text-text">Profile</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              onSubmit={handleSubmitProfile(onSubmitProfile)}
              className="space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Display Name"
                  placeholder="John Doe"
                  {...registerProfile("displayName")}
                  error={profileErrors.displayName?.message}
                  icon={<User className="h-4 w-4" />}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="john@example.com"
                  {...registerProfile("email")}
                  error={profileErrors.email?.message}
                  icon={<Mail className="h-4 w-4" />}
                />
              </div>
              <Button type="submit">Save Changes</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === "security" && (
        <>
          <Card>
            <CardHeader>
              <h3 className="font-medium text-text">Change Password</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <form
                onSubmit={handleSubmitPassword(onSubmitPassword)}
                className="space-y-4"
              >
                {passwordError && (
                  <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}
                {passwordSuccess && (
                  <div className="flex items-center gap-2 p-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm">
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                <div className="relative">
                  <Input
                    label="Current Password"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...registerPassword("currentPassword")}
                    error={passwordErrors.currentPassword?.message}
                    icon={<Lock className="h-4 w-4" />}
                    disabled={changePasswordMutation.isPending}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-[38px] text-text-muted hover:text-text"
                    aria-label={
                      showCurrentPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    label="New Password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...registerPassword("newPassword")}
                    error={passwordErrors.newPassword?.message}
                    helperText="At least 12 characters"
                    icon={<Lock className="h-4 w-4" />}
                    disabled={changePasswordMutation.isPending}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-[38px] text-text-muted hover:text-text"
                    aria-label={
                      showNewPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    label="Confirm New Password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...registerPassword("confirmPassword")}
                    error={passwordErrors.confirmPassword?.message}
                    icon={<Lock className="h-4 w-4" />}
                    disabled={changePasswordMutation.isPending}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-[38px] text-text-muted hover:text-text"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <Button
                  type="submit"
                  loading={changePasswordMutation.isPending}
                >
                  Change Password
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-medium text-text">Sessions</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="ghost"
                className="text-danger w-full justify-start"
                onClick={logout}
              >
                Sign out everywhere
              </Button>
              <p className="text-sm text-text-muted">
                This will sign you out of all devices and revoke all active
                sessions.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
