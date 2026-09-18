import { Link } from "react-router";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/Feedback";

export function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <ErrorState
        title="Something went wrong"
        description="An unexpected error occurred. Please try again."
        action={
          <Button onClick={() => window.location.reload()}>Reload</Button>
        }
      />
    </div>
  );
}
