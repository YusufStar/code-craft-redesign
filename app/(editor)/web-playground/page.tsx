import React from "react";
import { Metadata } from "next";

import WebPlayground from "@/components/web-playground/web-playground";

export const metadata: Metadata = {
  title:
    "CodeCraft IDE - Online React Editörü | Canlı Kod Önizleme ve Anlık Build",
  description:
    "React projelerinizi online olarak geliştirin ve anında sonuçlar alın. Canlı kod önizleme, anlık build ve hatasız bir geliştirme deneyimi sunan CodeCraft IDE'nin React editörünü keşfedin.",
  keywords:
    "React Editör, Online React IDE, Canlı Kod Önizleme, React Online Geliştirme, Anlık Build, React Proje Geliştirme, CodeCraft IDE",
  openGraph: {
    title: "CodeCraft IDE - Online React Editörü",
    description:
      "React projelerinizi online olarak geliştirin ve sonuçları anında görün. Canlı kod önizleme ve anlık build özellikleriyle hatasız bir geliştirme deneyimi sunuyoruz.",
    url: "https://codecraft-ide.com/react-editor",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeCraft IDE - Online React Editörü",
    description:
      "Canlı kod önizleme ve anlık build özellikleriyle React projelerinizi online olarak geliştirin. CodeCraft IDE ile geliştirme deneyiminizi bir üst seviyeye taşıyın!",
  },
  robots: "index, follow",
};

const page = () => {
  return (
    <div className="h-full w-full p-4 relative">
      <div className="h-full w-full rounded-xl border border-white/10 bg-[#0A0A0C]/80 backdrop-blur-xl backdrop-saturate-200 shadow-2xl">
        <WebPlayground />
      </div>
    </div>
  );
};

export default page;
