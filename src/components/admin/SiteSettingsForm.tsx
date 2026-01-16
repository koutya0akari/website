"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash2, GripVertical } from "lucide-react";
import type { ProjectSummary, ActivityItem } from "@/lib/types";
import { MarkdownTextarea } from "./MarkdownTextarea";

interface SiteSettings {
  projects: ProjectSummary[];
  activities: ActivityItem[];
}

export function SiteSettingsForm() {
  const [settings, setSettings] = useState<SiteSettings>({
    projects: [],
    activities: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"projects" | "activities">("projects");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/site");
      if (res.ok) {
        const { data } = await res.json();
        setSettings({
          projects: data.projects || [],
          activities: data.activities || [],
        });
      }
    } catch (error) {
      console.error("Failed to fetch site settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        alert("保存しました");
      } else {
        alert("保存に失敗しました");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const generateId = () => Math.random().toString(36).substring(2, 9);

  // Project helpers
  const addProject = () => {
    setSettings({
      ...settings,
      projects: [...settings.projects, { id: generateId(), title: "", summary: "", highlights: [], link: "", status: "" }],
    });
  };
  const updateProject = (index: number, field: keyof ProjectSummary, value: string | string[]) => {
    const newProjects = [...settings.projects];
    newProjects[index] = { ...newProjects[index], [field]: value };
    setSettings({ ...settings, projects: newProjects });
  };
  const removeProject = (index: number) => {
    setSettings({ ...settings, projects: settings.projects.filter((_, i) => i !== index) });
  };

  // Activity helpers
  const addActivity = () => {
    setSettings({
      ...settings,
      activities: [...settings.activities, { id: generateId(), year: "", items: [] }],
    });
  };
  const updateActivity = (index: number, field: keyof ActivityItem, value: string | string[]) => {
    const newActivities = [...settings.activities];
    newActivities[index] = { ...newActivities[index], [field]: value };
    setSettings({ ...settings, activities: newActivities });
  };
  const removeActivity = (index: number) => {
    setSettings({ ...settings, activities: settings.activities.filter((_, i) => i !== index) });
  };

  if (loading) {
    return <div className="text-center text-gray-400">読み込み中...</div>;
  }

  const tabs = [
    { id: "projects", label: "プロジェクト" },
    { id: "activities", label: "近年の活動" },
  ] as const;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Site Settings</h1>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-night hover:bg-accent/90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "保存中..." : "保存"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-night-muted">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-accent text-accent"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Projects Tab */}
      {activeTab === "projects" && (
        <div className="space-y-4">
          {settings.projects.map((project, index) => (
            <div key={project.id} className="rounded-lg border border-night-muted bg-night-soft p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                  <GripVertical className="h-4 w-4" />
                  <span className="text-sm">プロジェクト {index + 1}</span>
                </div>
                <button type="button" onClick={() => removeProject(index)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={project.title}
                    onChange={(e) => updateProject(index, "title", e.target.value)}
                    className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 focus:border-accent focus:outline-none"
                    placeholder="プロジェクト名"
                  />
                  <input
                    type="text"
                    value={project.status || ""}
                    onChange={(e) => updateProject(index, "status", e.target.value)}
                    className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 focus:border-accent focus:outline-none"
                    placeholder="ステータス（進行中、完了など）"
                  />
                </div>
                <MarkdownTextarea
                  value={project.summary}
                  onChange={(value) => updateProject(index, "summary", value)}
                  rows={2}
                  placeholder="概要"
                />
                <input
                  type="text"
                  value={project.highlights?.join(", ") || ""}
                  onChange={(e) => updateProject(index, "highlights", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                  className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 focus:border-accent focus:outline-none"
                  placeholder="ハイライト（カンマ区切り）"
                />
                <input
                  type="url"
                  value={project.link || ""}
                  onChange={(e) => updateProject(index, "link", e.target.value)}
                  className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 focus:border-accent focus:outline-none"
                  placeholder="リンクURL（オプション）"
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addProject}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-night-muted py-4 text-gray-400 hover:border-accent hover:text-accent"
          >
            <Plus className="h-4 w-4" />
            プロジェクトを追加
          </button>
        </div>
      )}

      {/* Activities Tab */}
      {activeTab === "activities" && (
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            年ごとの活動を管理します。GitHub からのコミット情報は自動取得されるため、ここでは手動で追加する活動（セミナー参加、発表など）を設定してください。
          </p>
          {settings.activities.map((activity, index) => (
            <div key={activity.id} className="rounded-lg border border-night-muted bg-night-soft p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                  <GripVertical className="h-4 w-4" />
                  <span className="text-sm">活動 {index + 1}</span>
                </div>
                <button type="button" onClick={() => removeActivity(index)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">年</label>
                  <input
                    type="text"
                    value={activity.year}
                    onChange={(e) => updateActivity(index, "year", e.target.value)}
                    className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 focus:border-accent focus:outline-none"
                    placeholder="2025"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">活動項目（改行区切り）</label>
                  <textarea
                    value={activity.items.join("\n")}
                    onChange={(e) => updateActivity(index, "items", e.target.value.split("\n").filter(Boolean))}
                    className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 focus:border-accent focus:outline-none"
                    rows={5}
                    placeholder="第8回すうがく徒のつどい 参加・運営&#10;spm29th [SGL] 参加・運営&#10;..."
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addActivity}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-night-muted py-4 text-gray-400 hover:border-accent hover:text-accent"
          >
            <Plus className="h-4 w-4" />
            年を追加
          </button>
        </div>
      )}
    </form>
  );
}
