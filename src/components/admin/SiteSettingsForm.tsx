"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash2, GripVertical } from "lucide-react";
import type { ProjectSummary, ActivityItem, SeminarTheme, LearningTheme, SeminarThemeReference } from "@/lib/types";
import { MarkdownTextarea } from "./MarkdownTextarea";

interface SiteSettings {
  projects: ProjectSummary[];
  activities: ActivityItem[];
  seminars: SeminarTheme[];
  learningThemes: LearningTheme[];
}

export function SiteSettingsForm() {
  const [settings, setSettings] = useState<SiteSettings>({
    projects: [],
    activities: [],
    seminars: [],
    learningThemes: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"projects" | "activities" | "seminars" | "learningThemes">("projects");

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
          seminars: data.seminars || [],
          learningThemes: data.learningThemes || [],
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

  // Seminar helpers
  const addSeminar = () => {
    setSettings({
      ...settings,
      seminars: [...settings.seminars, { id: generateId(), title: "", summary: "", references: [] }],
    });
  };
  const updateSeminar = (index: number, field: keyof SeminarTheme, value: string | SeminarThemeReference[]) => {
    const newSeminars = [...settings.seminars];
    newSeminars[index] = { ...newSeminars[index], [field]: value };
    setSettings({ ...settings, seminars: newSeminars });
  };
  const removeSeminar = (index: number) => {
    setSettings({ ...settings, seminars: settings.seminars.filter((_, i) => i !== index) });
  };
  const addSeminarReference = (seminarIndex: number) => {
    const newSeminars = [...settings.seminars];
    const refs = newSeminars[seminarIndex].references || [];
    newSeminars[seminarIndex] = { ...newSeminars[seminarIndex], references: [...refs, { label: "", url: "" }] };
    setSettings({ ...settings, seminars: newSeminars });
  };
  const updateSeminarReference = (seminarIndex: number, refIndex: number, field: keyof SeminarThemeReference, value: string) => {
    const newSeminars = [...settings.seminars];
    const refs = [...(newSeminars[seminarIndex].references || [])];
    refs[refIndex] = { ...refs[refIndex], [field]: value };
    newSeminars[seminarIndex] = { ...newSeminars[seminarIndex], references: refs };
    setSettings({ ...settings, seminars: newSeminars });
  };
  const removeSeminarReference = (seminarIndex: number, refIndex: number) => {
    const newSeminars = [...settings.seminars];
    const refs = (newSeminars[seminarIndex].references || []).filter((_, i) => i !== refIndex);
    newSeminars[seminarIndex] = { ...newSeminars[seminarIndex], references: refs };
    setSettings({ ...settings, seminars: newSeminars });
  };

  // Learning Theme helpers
  const addLearningTheme = () => {
    setSettings({
      ...settings,
      learningThemes: [...settings.learningThemes, { id: generateId(), title: "", summary: "" }],
    });
  };
  const updateLearningTheme = (index: number, field: keyof LearningTheme, value: string) => {
    const newThemes = [...settings.learningThemes];
    newThemes[index] = { ...newThemes[index], [field]: value };
    setSettings({ ...settings, learningThemes: newThemes });
  };
  const removeLearningTheme = (index: number) => {
    setSettings({ ...settings, learningThemes: settings.learningThemes.filter((_, i) => i !== index) });
  };

  if (loading) {
    return <div className="text-center text-gray-400">読み込み中...</div>;
  }

  const tabs = [
    { id: "projects", label: "プロジェクト" },
    { id: "activities", label: "近年の活動" },
    { id: "seminars", label: "自主ゼミ" },
    { id: "learningThemes", label: "学習テーマ" },
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

      {/* Seminars Tab */}
      {activeTab === "seminars" && (
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            自主ゼミのテーマを管理します。各ゼミのタイトル、概要、参考文献を設定できます。
          </p>
          {settings.seminars.map((seminar, index) => (
            <div key={seminar.id} className="rounded-lg border border-night-muted bg-night-soft p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                  <GripVertical className="h-4 w-4" />
                  <span className="text-sm">ゼミ {index + 1}</span>
                </div>
                <button type="button" onClick={() => removeSeminar(index)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-4">
                <input
                  type="text"
                  value={seminar.title}
                  onChange={(e) => updateSeminar(index, "title", e.target.value)}
                  className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 focus:border-accent focus:outline-none"
                  placeholder="ゼミのタイトル（例: スキーム論）"
                />
                <MarkdownTextarea
                  value={seminar.summary}
                  onChange={(value) => updateSeminar(index, "summary", value)}
                  rows={3}
                  placeholder="概要（使用テキスト、目標など）"
                />
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">参考文献リンク（オプション）</label>
                  {(seminar.references || []).map((ref, refIndex) => (
                    <div key={refIndex} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={ref.label}
                        onChange={(e) => updateSeminarReference(index, refIndex, "label", e.target.value)}
                        className="w-1/3 rounded-md border border-night-muted bg-night px-3 py-2 text-sm text-gray-100 focus:border-accent focus:outline-none"
                        placeholder="ラベル"
                      />
                      <input
                        type="url"
                        value={ref.url}
                        onChange={(e) => updateSeminarReference(index, refIndex, "url", e.target.value)}
                        className="flex-1 rounded-md border border-night-muted bg-night px-3 py-2 text-sm text-gray-100 focus:border-accent focus:outline-none"
                        placeholder="URL"
                      />
                      <button
                        type="button"
                        onClick={() => removeSeminarReference(index, refIndex)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addSeminarReference(index)}
                    className="flex items-center gap-1 text-sm text-accent hover:text-accent/80"
                  >
                    <Plus className="h-3 w-3" />
                    参考文献を追加
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addSeminar}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-night-muted py-4 text-gray-400 hover:border-accent hover:text-accent"
          >
            <Plus className="h-4 w-4" />
            ゼミを追加
          </button>
        </div>
      )}

      {/* Learning Themes Tab */}
      {activeTab === "learningThemes" && (
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            学習テーマを管理します。現在取り組んでいる、または興味のある学習テーマを設定できます。
          </p>
          {settings.learningThemes.map((theme, index) => (
            <div key={theme.id} className="rounded-lg border border-night-muted bg-night-soft p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                  <GripVertical className="h-4 w-4" />
                  <span className="text-sm">テーマ {index + 1}</span>
                </div>
                <button type="button" onClick={() => removeLearningTheme(index)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-4">
                <input
                  type="text"
                  value={theme.title}
                  onChange={(e) => updateLearningTheme(index, "title", e.target.value)}
                  className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 focus:border-accent focus:outline-none"
                  placeholder="テーマ名（例: 導来代数幾何）"
                />
                <MarkdownTextarea
                  value={theme.summary}
                  onChange={(value) => updateLearningTheme(index, "summary", value)}
                  rows={2}
                  placeholder="概要"
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addLearningTheme}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-night-muted py-4 text-gray-400 hover:border-accent hover:text-accent"
          >
            <Plus className="h-4 w-4" />
            テーマを追加
          </button>
        </div>
      )}
    </form>
  );
}
