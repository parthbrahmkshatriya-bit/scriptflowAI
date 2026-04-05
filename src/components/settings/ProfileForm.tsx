"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Props {
  userId: string;
  initialName: string;
  email: string;
}

export default function ProfileForm({ userId, initialName, email }: Props) {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from("users")
      .update({ full_name: name.trim() || null })
      .eq("id", userId);
    if (error) {
      toast.error("Failed to save changes");
    } else {
      toast.success("Profile updated");
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled className="opacity-60" />
        <p className="text-xs text-muted-foreground">Email cannot be changed here</p>
      </div>
      <Button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
