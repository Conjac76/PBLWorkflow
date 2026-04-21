import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
const TeacherDashboardContext = createContext(null);
export const TeacherDashboardProvider = ({ children }) => {
    const [groups, setGroups] = useState([]);
    const [selectedGroupId, setSelectedGroupIdState] = useState(null);
    const [evidence, setEvidence] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const refreshDashboard = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getTeacherGroups();
            setGroups(data.groups);
            if (!selectedGroupId && data.groups.length > 0) {
                setSelectedGroupIdState(data.groups[0].groupId);
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load dashboard");
        }
        finally {
            setLoading(false);
        }
    };
    const refreshEvidence = async () => {
        if (!selectedGroupId)
            return;
        setLoading(true);
        setError(null);
        try {
            const next = await api.getTeacherEvidence(selectedGroupId);
            setEvidence(next);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load evidence");
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        void refreshDashboard();
    }, []);
    useEffect(() => {
        if (!selectedGroupId)
            return;
        void refreshEvidence();
    }, [selectedGroupId]);
    const value = useMemo(() => ({
        groups,
        selectedGroupId,
        setSelectedGroupId: setSelectedGroupIdState,
        evidence,
        loading,
        error,
        refreshEvidence,
        refreshDashboard,
    }), [groups, selectedGroupId, evidence, loading, error]);
    return _jsx(TeacherDashboardContext.Provider, { value: value, children: children });
};
export const useTeacherDashboard = () => {
    const value = useContext(TeacherDashboardContext);
    if (!value) {
        throw new Error("useTeacherDashboard must be used within TeacherDashboardProvider");
    }
    return value;
};
