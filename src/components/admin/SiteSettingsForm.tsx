"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash2, GripVertical } from "lucide-react";
import type { FocusArea, ProjectSummary, TimelineItem, ContactLink } from "@/lib/types";

interface SiteSettings {
  heroTitle: string;
  heroLead: string;
  heroPrimaryCtaLabel: string;
  heroPrimaryCtaUrl: string;
  heroSecondaryCtaLabel: string;
  heroSecondaryCtaUrl: string;
  focuses: FocusArea[];
  projects: ProjectSummary[];
  timeline: TimelineItem[];
  contactLinks: ContactLink[];
}

export function SiteSettingsForm() {
  const [settings, setSettings] = useState<SiteSettings>({
    heroTitle: "",
    heroLead: "",
    heroPrimaryCtaLabel: "",
    heroPrimaryCtaUrl: "",
    heroSecondaryCtaLabel: "",
    heroSecondaryCtaUrl: "",
    focuses: [],
    projects: [],
    timeline: [],
    contactLinks: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"hero" | "focuses" | "projects" | "timeline" | "contacts">("hero");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/site");
      if (res.ok) {
        const { data } = await res.json();
        setSettings(data);
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

  // Focus helpers
  const addFocus = () => {
    setSettings({
      ...settings,
      focuses: [...settings.focuses, { id: generateId(), title: "", description: "" }],
    });
  };
  const updateFocus = (index: number, field: keyof FocusArea, value: string) => {
    const newFocuses = [...settings.focuses];
    newFocuses[index] = { ...newFocuses[index], [field]: value };
    setSettings({ ...settings, focuses: newFocuses });
  };
  const removeFocus = (index: number) => {
    setSettings({ ...settings, focuses: settings.focuses.filter((_, i) => i !== index) });
  };

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

  // Timeline helpers
  const addTimelineItem = () => {
    setSettings({
      ...settings,
      timeline: [...settings.timeline, { id: generateId(), title: "", date: "", description: "", linkLabel: "", linkUrl: "" }],
    });
  };
  const updateTimeline = (index: number, field: keyof TimelineItem, value: string) => {
    const newTimeline = [...settings.timeline];
    newTimeline[index] = { ...newTimeline[index], [field]: value };
    setSettings({ ...settings, timeline: newTimeline });
  };
  const removeTimeline = (index: number) => {
    setSettings({ ...settings, timeline: settings.timeline.filter((_, i) => i !== index) });
  };

  // Contact helpers
  const addContact = () => {
    setSettings({
      ...settings,
      contactLinks: [...settings.contactLinks, { id: generateId(), label: "", url: "" }],
    });
  };
  const updateContact = (index: number, field: keyof ContactLink, value: string) => {
    const newContacts = [...settings.contactLinks];
    newContacts[index] = { ...newContacts[index], [field]: value };
    setSettings({ ...settings, contactLinks: newContacts });
  };
  const removeContact = (index: number) => {
    setSettings({ ...settings, contactLinks: settings.contactLinks.filter((_, i) => i !== index) });
  };

  if (loading) {
    return <div className="text-center text-gray-400">読み込み中...</div>;
  }

  const tabs = [
    { id: "hero", label: "ヒーロー" },
    { id: "focuses", label: "フォーカス" },
    { id: "projects", label: "プロジェクト" },
    { id: "timeline", label: "タイムライン" },
    { id: "contacts", label: "連絡先" },
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

      {/* Hero Tab */}
      {activeTab === "hero" && (
        <div className="space-y-4 rounded-lg border border-night-muted bg-night-soft p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">ヒーロータイトル</label>
            <input
              type="text"
              value={settings.heroTitle}
              onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
              className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 focus:border-accent focus:outline-none"
              placeholder="メインタイトル"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">リード文</label>
            <textarea
              value={settings.heroLead}
              onChange={(e) => setSettings({ ...settings, heroLead: e.target.value })}
              rows={3}
              className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 focus:border-accent focus:outline-none"
              placeholder="サブタイトル・説明文"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">プライマリCTAラベル</label>
              <input
                type="text"
                value={settings.heroPrimaryCtaLabel}
                onChange={(e) => setSettings({ ...settings, heroPrimaryCtaLabel: e.target.value })}
                className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 focus:border-accent focus:outline-none"
                placeholder="ボタンテキスト"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">プライマリCTA URL</label>
              <input
                type="text"
                value={settings.heroPrimaryCtaUrl}
                onChange={(e) => setSettings({ ...settings, heroPrimaryCtaUrl: e.target.value })}
                className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 focus:border-accent focus:outline-none"
                placeholder="/about"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">セカンダリCTAラベル</label>
              <input
                type="text"
                value={settings.heroSecondaryCtaLabel}
                onChange={(e) => setSettings({ ...settings, heroSecondaryCtaLabel: e.target.value })}
                className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 focus:border-accent focus:outline-none"
                placeholder="ボタンテキスト（オプション）"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">セカンダリCTA URL</label>
              <input
                type="text"
                value={settings.heroSecondaryCtaUrl}
                onChange={(e) => setSettings({ ...settings, heroSecondaryCtaUrl: e.target.value })}
                className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 focus:border-accent focus:outline-none"
                placeholder="/contact"
              />
            </div>
          </div>
        </div>
      )}

      {/* Focuses Tab */}
      {activeTab === "focuses" && (
        <div className="space-y-4">
          {settings.focuses.map((focus, index) => (
            <div key={focus.id} className="rounded-lg border border-night-muted bg-night-soft p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                  <GripVertical className="h-4 w-4" />
                  <span className="text-sm">フォーカス {index + 1}</span>
                </div>
                <button type="button" onClick={() => removeFocus(index)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-4">
                <input
                  type="text"
                  value={focus.title}
                  onChange={(e) => updateFocus(index, "title", e.target.value)}
                  className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 focus:border-accent focus:outline-none"
                  placeholder="タイトル"
                />
                <textarea
                  value={focus.description}
                  onChange={(e) => updateFocus(index, "description", e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 focus:border-accent focus:outline-none"
                  placeholder="説明"
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addFocus}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-night-muted py-4 text-gray-400 hover:border-accent hover:text-accent"
          >
            <Plus className="h-4 w-4" />
            フォーカスを追加
          </button>
        </div>
      )}

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
                <textarea
                  value={project.summary}
                  onChange={(e) => updateProject(index, "summary", e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 focus:border-accent focus:outline-none"
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

      {/* Timeline Tab */}
      {activeTab === "timeline" && (
        <div className="space-y-4">
          {settings.timeline.map((item, index) => (
            <div key={item.id} className="rounded-lg border border-night-muted bg-night-soft p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                  <GripVertical className="h-4 w-4" />
                  <span className="text-sm">タイムライン {index + 1}</span>
                </div>
                <button type="button" onClick={() => removeTimeline(index)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateTimeline(index, "title", e.target.value)}
                    className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 focus:border-accent focus:outline-none"
                    placeholder="タイトル"
                  />
                  <input
                    type="text"
                    value={item.date}
                    onChange={(e) => updateTimeline(index, "date", e.target.value)}
                    className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 focus:border-accent focus:outline-none"
                    placeholder="日付（2024年4月など）"
                  />
                </div>
                <textarea
                  value={item.description || ""}
                  onChange={(e) => updateTimeline(index, "description", e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 focus:border-accent focus:outline-none"
                  placeholder="説明（オプション）"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={item.linkLabel || ""}
                    onChange={(e) => updateTimeline(index, "linkLabel", e.target.value)}
                    className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 focus:border-accent focus:outline-none"
                    placeholder="リンクラベル"
                  />
                  <input
                    type="url"
                    value={item.linkUrl || ""}
                    onChange={(e) => updateTimeline(index, "linkUrl", e.target.value)}
                    className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 focus:border-accent focus:outline-none"
                    placeholder="リンクURL"
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addTimelineItem}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-night-muted py-4 text-gray-400 hover:border-accent hover:text-accent"
          >
            <Plus className="h-4 w-4" />
            タイムライン項目を追加
          </button>
        </div>
      )}

      {/* Contacts Tab */}
      {activeTab === "contacts" && (
        <div className="space-y-4">
          {settings.contactLinks.map((contact, index) => (
            <div key={contact.id} className="rounded-lg border border-night-muted bg-night-soft p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                  <GripVertical className="h-4 w-4" />
                  <span className="text-sm">連絡先 {index + 1}</span>
                </div>
                <button type="button" onClick={() => removeContact(index)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={contact.label}
                  onChange={(e) => updateContact(index, "label", e.target.value)}
                  className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 focus:border-accent focus:outline-none"
                  placeholder="ラベル（Twitter, GitHubなど）"
                />
                <input
                  type="url"
                  value={contact.url}
                  onChange={(e) => updateContact(index, "url", e.target.value)}
                  className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 focus:border-accent focus:outline-none"
                  placeholder="URL"
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addContact}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-night-muted py-4 text-gray-400 hover:border-accent hover:text-accent"
          >
            <Plus className="h-4 w-4" />
            連絡先を追加
          </button>
        </div>
      )}
    </form>
  );
}

