"use client";

import { useState } from "react";
import UploadTrackForm from "@/components/UploadTrackForm";
import BatchUploadForm from "@/components/BatchUploadForm";

export default function AdminUpload() {
  const [modo, setModo] = useState<"uma" | "lote">("uma");

  return (
    <div>
      <div className="mb-4 inline-flex gap-1 rounded-xl border border-[#1a1a1a] p-1">
        <button
          type="button"
          onClick={() => setModo("uma")}
          className={aba(modo === "uma")}
        >
          Uma música
        </button>
        <button
          type="button"
          onClick={() => setModo("lote")}
          className={aba(modo === "lote")}
        >
          Várias de uma vez
        </button>
      </div>

      {modo === "uma" ? <UploadTrackForm /> : <BatchUploadForm />}
    </div>
  );
}

function aba(ativo: boolean) {
  return `rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
    ativo ? "bg-[#CC1111] text-white" : "text-[#888] hover:text-white"
  }`;
}
