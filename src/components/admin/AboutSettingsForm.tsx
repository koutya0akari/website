"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash2, GripVertical } from "lucide-react";
import type { AboutSection } from "@/lib/types";
import { MarkdownTextarea } from "./MarkdownTextarea";

interface AboutSettings {
  intro: string;
  mission: string;
  sections: AboutSection[];
  skills: string[];
  quote: string;
}

export function AboutSettingsForm() {
  const [settings, setSettings] = useState<AboutSettings>({
    intro: "",
    mission: "",
    sections: [],
    skills: [],
    quote: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/about");
      if (res.ok) {
        const { data } = await res.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Failed to fetch about settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/about", {
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

  // Section helpers
  const addSection = () => {
    setSettings({
      ...settings,
      sections: [...settings.sections, { heading: "", body: "" }],
    });
  };
  const updateSection = (index: number, field: keyof AboutSection, value: string) => {
    const newSections = [...settings.sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setSettings({ ...settings, sections: newSections });
  };
  const removeSection = (index: number) => {
    setSettings({ ...settings, sections: settings.sections.filter((_, i) => i !== index) });
  };

  // Skill helpers
  const addSkill = () => {
    if (skillInput.trim() && !settings.skills.includes(skillInput.trim())) {
      setSettings({ ...settings, skills: [...settings.skills, skillInput.trim()] });
      setSkillInput("");
    }
  };
  const removeSkill = (skill: string) => {
    setSettings({ ...settings, skills: settings.skills.filter((s) => s !== skill) });
  };

  if (loading) {
    return <div className="text-center text-gray-400">読み込み中...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">About Settings</h1>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-night hover:bg-accent/90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "保存中..." : "保存"}
        </button>
      </div>

      {/* Basic Info */}
      <div className="space-y-4 rounded-lg border border-night-muted bg-night-soft p-6">
        <h2 className="text-lg font-semibold text-white">基本情報</h2>

        <MarkdownTextarea
          label="イントロダクション"
          value={settings.intro}
          onChange={(value) => setSettings({ ...settings, intro: value })}
          rows={3}
          placeholder="自己紹介文"
        />

        <MarkdownTextarea
          label="ミッション"
          value={settings.mission}
          onChange={(value) => setSettings({ ...settings, mission: value })}
          rows={3}
          placeholder="ミッション・目標"
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">引用・モットー</label>
          <input
            type="text"
            value={settings.quote}
            onChange={(e) => setSettings({ ...settings, quote: e.target.value })}
            className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 focus:border-accent focus:outline-none"
            placeholder="座右の銘など（オプション）"
          />
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">セクション</h2>
        {settings.sections.map((section, index) => (
          <div key={index} className="rounded-lg border border-night-muted bg-night-soft p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400">
                <GripVertical className="h-4 w-4" />
                <span className="text-sm">セクション {index + 1}</span>
              </div>
              <button type="button" onClick={() => removeSection(index)} className="text-red-400 hover:text-red-300">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-4">
              <input
                type="text"
                value={section.heading}
                onChange={(e) => updateSection(index, "heading", e.target.value)}
                className="w-full rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 focus:border-accent focus:outline-none"
                placeholder="見出し"
              />
              <MarkdownTextarea
                value={section.body}
                onChange={(value) => updateSection(index, "body", value)}
                rows={3}
                placeholder="本文"
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addSection}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-night-muted py-4 text-gray-400 hover:border-accent hover:text-accent"
        >
          <Plus className="h-4 w-4" />
          セクションを追加
        </button>
      </div>

      {/* Skills */}
      <div className="space-y-4 rounded-lg border border-night-muted bg-night-soft p-6">
        <h2 className="text-lg font-semibold text-white">スキル / ツール</h2>

        <div className="flex gap-2">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
            className="flex-1 rounded-md border border-night-muted bg-night px-4 py-2 text-gray-100 focus:border-accent focus:outline-none"
            placeholder="スキルを入力してEnter"
          />
          <button
            type="button"
            onClick={addSkill}
            className="rounded-md bg-night-muted px-4 py-2 text-sm text-gray-300 hover:bg-night-muted/80"
          >
            追加
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {settings.skills.map((skill) => (
            <span
              key={skill}
              className="flex items-center gap-1 rounded-md bg-accent/10 px-3 py-1 text-sm text-accent"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="hover:text-accent/80"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    </form>
  );
}

