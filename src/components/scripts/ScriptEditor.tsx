"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import SceneCard from "@/components/scripts/SceneCard";
import CopyAllButton from "@/components/scripts/CopyAllButton";
import { Separator } from "@/components/ui/separator";
import type { Scene } from "@/types/database";

interface Props {
  scriptId: string;
  initialScenes: Scene[];
  canGenerateVoiceover: boolean;
  canGenerateVideo: boolean;
}

export default function ScriptEditor({ scriptId, initialScenes, canGenerateVoiceover, canGenerateVideo }: Props) {
  const [scenes, setScenes] = useState<Scene[]>(initialScenes);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSceneChange = useCallback((updatedScene: Scene) => {
    setScenes((prev) =>
      prev.map((s) => (s.id === updatedScene.id ? updatedScene : s))
    );
    setIsDirty(true);
  }, []);

  async function saveChanges() {
    setSaving(true);
    try {
      const res = await fetch(`/api/scripts/${scriptId}/scenes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenes }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Failed to save changes");
        return;
      }

      setIsDirty(false);
      toast.success("Changes saved!");
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  }

  const allPrompts = scenes
    .map((s, i) => `Scene ${i + 1}: ${s.ai_generation_prompt}`)
    .join("\n\n");

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Scenes</h2>
        <div className="flex items-center gap-2">
          <CopyAllButton text={allPrompts} />
          {isDirty && (
            <Button
              size="sm"
              onClick={saveChanges}
              disabled={saving}
              className="gap-1"
            >
              {saving ? (
                <>
                  <span className="animate-spin inline-block w-3 h-3 border border-current border-t-transparent rounded-full" />
                  Saving…
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          )}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        {scenes.map((scene) => (
          <SceneCard
            key={scene.id}
            scene={scene}
            canGenerateVoiceover={canGenerateVoiceover}
            canGenerateVideo={canGenerateVideo}
            onChange={handleSceneChange}
          />
        ))}
      </div>
    </>
  );
}
