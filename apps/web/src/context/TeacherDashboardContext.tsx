import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { GroupSnapshot } from "../types/domain";

interface TeacherDashboardContextValue {
  groups: GroupSnapshot[];
  selectedGroupId: string | null;
  setSelectedGroupId: (groupId: string) => void;
  evidence: Awaited<ReturnType<typeof api.getTeacherEvidence>> | null;
  loading: boolean;
  error: string | null;
  refreshEvidence: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
}

const TeacherDashboardContext = createContext<TeacherDashboardContextValue | null>(null);

export const TeacherDashboardProvider = ({ children }: PropsWithChildren) => {
  const [groups, setGroups] = useState<GroupSnapshot[]>([]);
  const [selectedGroupId, setSelectedGroupIdState] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<Awaited<ReturnType<typeof api.getTeacherEvidence>> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTeacherGroups();
      setGroups(data.groups);
      if (!selectedGroupId && data.groups.length > 0) {
        setSelectedGroupIdState(data.groups[0].groupId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const refreshEvidence = async () => {
    if (!selectedGroupId) return;
    setLoading(true);
    setError(null);
    try {
      const next = await api.getTeacherEvidence(selectedGroupId);
      setEvidence(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load evidence");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshDashboard();
  }, []);

  useEffect(() => {
    if (!selectedGroupId) return;
    void refreshEvidence();
  }, [selectedGroupId]);

  const value = useMemo(
    () => ({
      groups,
      selectedGroupId,
      setSelectedGroupId: setSelectedGroupIdState,
      evidence,
      loading,
      error,
      refreshEvidence,
      refreshDashboard,
    }),
    [groups, selectedGroupId, evidence, loading, error],
  );

  return <TeacherDashboardContext.Provider value={value}>{children}</TeacherDashboardContext.Provider>;
};

export const useTeacherDashboard = (): TeacherDashboardContextValue => {
  const value = useContext(TeacherDashboardContext);
  if (!value) {
    throw new Error("useTeacherDashboard must be used within TeacherDashboardProvider");
  }
  return value;
};
