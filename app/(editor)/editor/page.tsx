import { Metadata } from "next";

import BaseEditor from "@/components/editors/BaseEditor";
import RightPanel from "@/components/editors/RightPanel";

export const metadata: Metadata = {
  title: "CodeCraft IDE - Ortak Kodlama ve Canlı Kod Çalıştırma",
  description:
    "CodeCraft IDE ile kullanıcılar, birden fazla kişiyle aynı odada ortak kodlama yapabilir, canlı olarak kodlarını yazabilir ve çalıştırabilir. Yenilikçi ve AI destekli modern bir kodlama platformu.",
  keywords:
    "CodeCraft IDE, Ortak Kodlama, Canlı Kodlama, Online Kod Editörü, Kodlama Platformu, Yapay Zeka Kodlama, Programlama",
  openGraph: {
    title: "CodeCraft IDE - Ortak Kodlama ve Canlı Kod Çalıştırma",
    description:
      "Yenilikçi AI destekli CodeCraft IDE ile birden fazla kişiyle ortak kodlama yapın. Kod yazmayı, paylaşmayı ve çalıştırmayı kolaylaştıran modern bir platform.",
    url: "https://codecraft-ide.com/editor",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeCraft IDE - Ortak Kodlama ve Canlı Kod Çalıştırma",
    description:
      "AI destekli CodeCraft IDE ile kodlarınızı yazın, paylaşın ve canlı çalıştırın. Birden fazla kişiyle aynı odada ortak kodlama yapabilirsiniz!",
  },
  robots: "index, follow",
};

export default function EditorPage() {
  return (
    <>
      {/* Editör container */}
      <div className="h-full w-full p-4 relative">
        <div className="h-full w-full rounded-xl border border-white/10 bg-[#0A0A0C]/80 backdrop-blur-xl backdrop-saturate-200 shadow-2xl">
          <BaseEditor />
        </div>
      </div>

      {/* Sağ Panel */}
      <RightPanel />
    </>
  );
}
