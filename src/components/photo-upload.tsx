"use client";

import * as React from "react";
import { Camera, Loader2, X } from "lucide-react";

interface PhotoUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  context?: "avatar" | "patient" | "logo";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-12 w-12",
  md: "h-20 w-20",
  lg: "h-28 w-28",
};

export function PhotoUpload({ value, onChange, context = "avatar", size = "md", className = "" }: PhotoUploadProps) {
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("context", context);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (data.success) {
        onChange(data.data.url);
      } else {
        alert(data.error || "Erro ao fazer upload");
      }
    } catch {
      alert("Erro de conexão ao fazer upload");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`${sizes[size]} rounded-full border-2 border-dashed border-gray-300 hover:border-teal-400 flex items-center justify-center overflow-hidden transition-colors bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2`}
      >
        {uploading ? (
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        ) : value ? (
          <img src={value} alt="Foto" className="h-full w-full object-cover" />
        ) : (
          <Camera className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {value && !uploading && (
        <button
          type="button"
          onClick={handleRemove}
          className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600 transition"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
