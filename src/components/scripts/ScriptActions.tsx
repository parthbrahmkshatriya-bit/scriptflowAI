"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Props {
  scriptId: string;
  isFavorite: boolean;
  isPublic: boolean;
  shareSlug: string | null;
}

export default function ScriptActions({
  scriptId,
  isFavorite: initialFavorite,
  isPublic: initialPublic,
  shareSlug: initialSlug,
}: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [favorite, setFavorite] = useState(initialFavorite);
  const [isPublic, setIsPublic] = useState(initialPublic);
  const [shareSlug, setShareSlug] = useState(initialSlug);
  const [deleting, setDeleting] = useState(false);

  async function toggleFavorite() {
    const next = !favorite;
    setFavorite(next); // optimistic
    const { error } = await supabase
      .from("scripts")
      .update({ is_favorite: next })
      .eq("id", scriptId);
    if (error) {
      setFavorite(!next);
      toast.error("Failed to update favorite");
    }
  }

  async function toggleShare() {
    if (!isPublic) {
      // Generate a slug and make public
      const slug =
        Math.random().toString(36).substring(2, 8) +
        Math.random().toString(36).substring(2, 8);
      const { error } = await supabase
        .from("scripts")
        .update({ is_public: true, share_slug: slug })
        .eq("id", scriptId);
      if (error) {
        toast.error("Failed to share script");
        return;
      }
      setIsPublic(true);
      setShareSlug(slug);
      const url = `${window.location.origin}/s/${slug}`;
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Share link copied to clipboard!");
      } catch {
        toast.success(`Share link: ${url}`);
      }
    } else {
      // Copy existing link
      const url = `${window.location.origin}/s/${shareSlug}`;
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Share link copied!");
      } catch {
        toast.info(`Share link: ${url}`);
      }
    }
  }

  async function handleDelete() {
    setDeleting(true);
    const { error } = await supabase.from("scripts").delete().eq("id", scriptId);
    if (error) {
      toast.error("Failed to delete script");
      setDeleting(false);
    } else {
      toast.success("Script deleted");
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        size="sm"
        variant="ghost"
        onClick={toggleFavorite}
        className={favorite ? "text-yellow-500 hover:text-yellow-400" : ""}
        title={favorite ? "Remove from favorites" : "Add to favorites"}
      >
        {favorite ? "★ Favorited" : "☆ Favorite"}
      </Button>

      <Button size="sm" variant="outline" onClick={toggleShare}>
        {isPublic ? "Copy Share Link" : "Share"}
      </Button>

      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
              Delete
            </Button>
          }
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this script?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the script and all its scenes. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
