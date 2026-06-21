import { useState } from "react";

interface PlayerAvatarProps {
  name: string;
  size?: number;
  className?: string;
}

export function PlayerAvatar({ name, size = 48, className = "" }: PlayerAvatarProps) {
  const [error, setError] = useState(false);
  const seed = encodeURIComponent(name);
  const avatarUrl = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${seed}&radius=50&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (error) {
    return (
      <div
        className={`rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-black font-mono text-primary flex-shrink-0 ${className}`}
        style={{ width: size, height: size, fontSize: Math.round(size * 0.32) }}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={avatarUrl}
      alt={name}
      width={size}
      height={size}
      className={`rounded-full object-cover flex-shrink-0 ${className}`}
      onError={() => setError(true)}
    />
  );
}
