"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase-browser";

export default function UserAvatar() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [initials,  setInitials]  = useState("?");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("name, avatar_url")
        .eq("id", user.id)
        .single();
      if (data) {
        setAvatarUrl(data.avatar_url || null);
        setInitials((data.name || "?").charAt(0).toUpperCase());
      }
    }
    load();
  }, []);

  return (
    <div style={{
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      backgroundColor: "rgba(201,184,122,0.12)",
      border: "1.5px solid rgba(201,184,122,0.35)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      flexShrink: 0,
    }}>
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt="avatar"
          width={32}
          height={32}
          style={{ borderRadius: "50%", objectFit: "cover" }}
        />
      ) : (
        <span style={{
          fontFamily: "Montserrat, sans-serif",
          fontSize: "13px",
          fontWeight: 700,
          color: "#C9B87A",
        }}>
          {initials}
        </span>
      )}
    </div>
  );
}
