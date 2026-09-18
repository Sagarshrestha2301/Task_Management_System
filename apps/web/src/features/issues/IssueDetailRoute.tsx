import { useParams, useNavigate } from "react-router";
import { IssueDetail } from "@/components/issues/IssueDetail";

export function IssueDetailRoute() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  return <IssueDetail projectId={projectId!} onClose={() => navigate(-1)} />;
}
