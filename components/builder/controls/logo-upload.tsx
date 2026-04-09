"use client";

import { useRef, useState } from "react";
import { useBuilder } from "@/components/builder/builder-provider";
import { cn } from "@/lib/utils";

export function LogoUpload() {
  const { config, applyChange } = useBuilder();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.match(/^image\/(svg\+xml|png|jpeg|jpg|webp)$/)) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        applyChange({ logoUrl: result });
      }
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#555]">
        Studio Logo
      </div>

      {config.logoUrl ? (
        <div className="flex items-center gap-3 rounded-lg border border-[#222] bg-[#111] p-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded border border-[#333] bg-[#0d0d0d]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={config.logoUrl}
              alt="Studio logo"
              className="h-10 w-10 object-contain"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-[#ccc]">Logo uploaded</p>
            <p className="text-[10px] text-[#555]">Stored in draft</p>
          </div>
          <button
            type="button"
            onClick={() => applyChange({ logoUrl: undefined })}
            className="shrink-0 text-[10px] font-semibold text-[#555] hover:text-[#FF3333] transition-colors"
          >
            Remove
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors",
            dragging
              ? "border-[#FF3333] bg-[rgba(255,51,51,0.05)]"
              : "border-[#333] bg-[#0d0d0d] hover:border-[#444]"
          )}
        >
          <svg className="h-6 w-6 text-[#444]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[11px] font-semibold text-[#555]">Drop logo here or click to upload</span>
          <span className="text-[10px] text-[#444]">SVG, PNG, JPG</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/svg+xml,image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  );
}

LogoUpload.displayName = "LogoUpload";
