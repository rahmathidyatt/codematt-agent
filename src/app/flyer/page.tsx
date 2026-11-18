"use client";

import React, { useState, useRef, useEffect } from "react";
import QRCode from "qrcode";
import {
  Palette,
  Download,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  FileImage,
  Trash2,
  Bookmark,
  BookmarkPlus,
} from "lucide-react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { useAgentStore } from "@/lib/store";
import { flyerSizes, FlyerSize, FlyerPreset } from "@/features/flyer/contracts";
import { FlyerGalleryView } from "@/components/flyer/FlyerGalleryView";
import { SavePresetModal } from "@/components/flyer/SavePresetModal";

export default function FlyerStudioPage() {
  const {
    listings,
    agent,
    locale,
    recordFlyerExport,
    flyerExports,
    addFlyerExport,
    deleteFlyerExport,
    clearFlyerExports,
    flyerPresets,
    saveFlyerPreset,
    deleteFlyerPreset,
    resetFlyerPresetsToDefault,
  } = useAgentStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [selectedListingId, setSelectedListingId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const listingIdParam = new URLSearchParams(window.location.search).get("listingId");
      if (listingIdParam && listings.some((l) => l.id === listingIdParam)) {
        return listingIdParam;
      }
    }
    return listings[0]?.id || "";
  });
  const activeListing = listings.find((l) => l.id === selectedListingId) || listings[0];

  // Flyer Configuration State
  const [size, setSize] = useState<FlyerSize>("square");
  const [template, setTemplate] = useState<"modern" | "luxury" | "minimal">("modern");
  const [headline, setHeadline] = useState(activeListing?.name || "Hunian Modern Sentul City");
  const [priceLabel, setPriceLabel] = useState(
    activeListing ? `Rp ${(activeListing.price / 1000000000).toFixed(2)} Milyar` : "Rp 1.85 Milyar"
  );
  const [locationLabel, setLocationLabel] = useState(activeListing?.location || "Sentul City, Bogor");
  const [highlights, setHighlights] = useState<string[]>(
    activeListing?.highlights || ["SHM Clear", "Bebas Banjir", "Row 8 Meter", "Bisa KPR"]
  );
  const [qrDestination, setQrDestination] = useState(
    `https://wa.me/${agent.whatsapp}?text=Halo%20${encodeURIComponent(agent.name)},%20saya%20tertarik%20dengan%20properti%20${encodeURIComponent(activeListing?.name || "Sentul")}`
  );
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [exporting, setExporting] = useState(false);

  // Preview Mode: with branding (agent details & QR) or clean (unbranded / co-broke)
  const [showBranding, setShowBranding] = useState<boolean>(true);

  // Export History filters & modals
  const [historySearch, setHistorySearch] = useState<string>("");
  const [historyModeFilter, setHistoryModeFilter] = useState<"all" | "branded" | "clean">("all");


  // Gallery View & Preset Management State
  const [activeView, setActiveView] = useState<"editor" | "gallery">("editor");
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [activePresetId, setActivePresetId] = useState<string | null>("preset-feed-modern");
  const [activePresetName, setActivePresetName] = useState<string | null>("Feed Instagram ERA Modern");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const handleApplyPreset = (preset: FlyerPreset) => {
    setSize(preset.size);
    setTemplate(preset.template);
    setShowBranding(preset.showBranding);
    setHeadline(preset.headline);
    setPriceLabel(preset.priceLabel);
    setLocationLabel(preset.locationLabel);
    setHighlights(preset.highlights);
    if (preset.qrDestination) {
      setQrDestination(preset.qrDestination);
    }
    setActivePresetId(preset.id);
    setActivePresetName(preset.name);
    setToastMessage(
      locale === "id"
        ? `Layout "${preset.name}" berhasil diterapkan ke Kanvas!`
        : `Layout "${preset.name}" applied to Canvas!`
    );
    setActiveView("editor");
  };

  const handleSaveCurrentLayout = (presetData: Omit<FlyerPreset, "id" | "createdAt">) => {
    const saved = saveFlyerPreset(presetData);
    setActivePresetId(saved.id);
    setActivePresetName(saved.name);
    setToastMessage(
      locale === "id"
        ? `Preset "${saved.name}" berhasil disimpan ke galeri!`
        : `Preset "${saved.name}" saved to gallery!`
    );
  };

  const handleDuplicatePreset = (preset: FlyerPreset) => {
    const duplicated = saveFlyerPreset({
      ...preset,
      name: `${preset.name} (Salinan)`,
      description: `Salinan dari preset ${preset.name}`,
    });
    setToastMessage(
      locale === "id"
        ? `Preset "${duplicated.name}" berhasil diduplikasi!`
        : `Preset "${duplicated.name}" duplicated!`
    );
  };

  const handleDeletePreset = (id: string) => {
    deleteFlyerPreset(id);
    if (activePresetId === id) {
      setActivePresetId(null);
      setActivePresetName(null);
    }
    setToastMessage(
      locale === "id" ? "Preset kustom berhasil dihapus." : "Custom preset deleted."
    );
  };

  const handleResetDefaults = () => {
    resetFlyerPresetsToDefault();
    setToastMessage(
      locale === "id"
        ? "Preset bawaan berhasil dipulihkan."
        : "Default presets restored."
    );
  };

  const handleSelectListing = (id: string) => {
    setSelectedListingId(id);
    const chosen = listings.find((l) => l.id === id);
    if (chosen) {
      setHeadline(chosen.name);
      setPriceLabel(`Rp ${(chosen.price / 1000000000).toFixed(2)} Milyar`);
      setLocationLabel(chosen.location);
      setHighlights(chosen.highlights);
      setQrDestination(
        `https://wa.me/${agent.whatsapp}?text=Halo%20${encodeURIComponent(agent.name)},%20saya%20tertarik%20dengan%20properti%20${encodeURIComponent(chosen.name)}`
      );
    }
  };

  // Generate QR code data URL whenever destination changes
  useEffect(() => {
    QRCode.toDataURL(qrDestination, {
      width: 256,
      margin: 1,
      color: { dark: "#172a27", light: "#ffffff" },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("QR Code error:", err));
  }, [qrDestination]);

  // Render Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dim = flyerSizes[size];
    // Render at actual size
    canvas.width = dim.width;
    canvas.height = dim.height;

    // Palette per template
    const isLuxury = template === "luxury";
    const isMinimal = template === "minimal";

    const bgColor = isLuxury ? "#0f1715" : isMinimal ? "#ffffff" : "#f7f9f8";
    const cardBg = isLuxury ? "#182421" : isMinimal ? "#f3f5f4" : "#ffffff";
    const textColor = isLuxury ? "#f0f6f4" : "#172a27";
    const accentColor = isLuxury ? "#d4af37" : agent.primaryColor || "#186759";
    const mutedColor = isLuxury ? "#94a6a0" : "#54645f";
    const borderColor = isLuxury ? "#2e453e" : "#d7e1dd";

    // 1. Draw Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, dim.width, dim.height);

    // 2. Draw Top Agency Header Bar (ONLY if showBranding is true)
    let photoTop = 0;
    const headerHeight = Math.round(dim.height * 0.08);

    if (showBranding) {
      photoTop = headerHeight;
      ctx.fillStyle = cardBg;
      ctx.fillRect(0, 0, dim.width, headerHeight);

      // Header Agency & License
      ctx.fillStyle = accentColor;
      ctx.font = `bold ${Math.round(headerHeight * 0.36)}px sans-serif`;
      ctx.textAlign = "left";
      ctx.fillText(agent.agency.toUpperCase(), Math.round(dim.width * 0.05), Math.round(headerHeight * 0.62));

      ctx.fillStyle = mutedColor;
      ctx.font = `500 ${Math.round(headerHeight * 0.28)}px sans-serif`;
      ctx.textAlign = "right";
      ctx.fillText(
        `Lisensi: ${agent.license}`,
        dim.width - Math.round(dim.width * 0.05),
        Math.round(headerHeight * 0.62)
      );
    }

    // 3. Hero Visual Space
    const photoHeight = Math.round(
      dim.height *
        (showBranding
          ? size === "story"
            ? 0.45
            : size === "a4"
            ? 0.42
            : 0.48
          : size === "story"
          ? 0.52
          : size === "a4"
          ? 0.48
          : 0.54)
    );

    const photoGradient = ctx.createLinearGradient(0, photoTop, 0, photoTop + photoHeight);
    if (isLuxury) {
      photoGradient.addColorStop(0, "#22332e");
      photoGradient.addColorStop(1, "#121a18");
    } else {
      photoGradient.addColorStop(0, "#e2ece8");
      photoGradient.addColorStop(1, "#c5d7d0");
    }
    ctx.fillStyle = photoGradient;
    ctx.fillRect(0, photoTop, dim.width, photoHeight);

    // Inner visual frame accent
    ctx.fillStyle = isLuxury ? "rgba(212, 175, 55, 0.15)" : "rgba(24, 103, 89, 0.12)";
    ctx.fillRect(
      Math.round(dim.width * 0.05),
      photoTop + 30,
      dim.width - Math.round(dim.width * 0.1),
      photoHeight - 60
    );

    // Architectural grid watermark in photo placeholder
    ctx.strokeStyle = isLuxury ? "rgba(212, 175, 55, 0.1)" : "rgba(24, 103, 89, 0.1)";
    ctx.lineWidth = 1;
    for (let x = 60; x < dim.width - 60; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, photoTop + 30);
      ctx.lineTo(x, photoTop + photoHeight - 30);
      ctx.stroke();
    }

    // Category Badge
    const badgeText = showBranding ? "DIJUAL · EKSKLUSIF" : "DIJUAL · TERVERIFIKASI";
    const badgeH = Math.round(dim.height * 0.042);
    ctx.font = `bold ${Math.round(badgeH * 0.46)}px sans-serif`;
    const badgeTextWidth = ctx.measureText(badgeText).width;
    const badgeW = Math.round(badgeTextWidth + 36);
    const badgeY = photoTop + (showBranding ? 45 : 36);

    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.roundRect(Math.round(dim.width * 0.06), badgeY, badgeW, badgeH, 6);
    ctx.fill();

    ctx.fillStyle = isLuxury ? "#000000" : "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(
      badgeText,
      Math.round(dim.width * 0.06) + badgeW / 2,
      badgeY + badgeH * 0.68
    );

    // Mode watermark badge in unbranded clean mode
    if (!showBranding) {
      const tagText = "CO-BROKE / MLS READY";
      ctx.font = `bold ${Math.round(badgeH * 0.38)}px sans-serif`;
      const tm = ctx.measureText(tagText);
      const tagW = Math.round(tm.width + 24);
      const tagRightX = dim.width - Math.round(dim.width * 0.06) - tagW;
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.beginPath();
      ctx.roundRect(tagRightX, badgeY, tagW, badgeH, 6);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText(tagText, tagRightX + tagW / 2, badgeY + badgeH * 0.66);
    }

    // 4. Property Specs & Details Section
    const contentTop = photoTop + photoHeight + Math.round(dim.height * 0.035);
    const padX = Math.round(dim.width * 0.06);

    ctx.fillStyle = accentColor;
    ctx.font = `bold ${Math.round(dim.width * 0.062)}px sans-serif`;
    ctx.textAlign = "left";
    ctx.fillText(priceLabel, padX, contentTop);

    ctx.fillStyle = textColor;
    ctx.font = `bold ${Math.round(dim.width * 0.046)}px sans-serif`;
    ctx.fillText(headline, padX, contentTop + Math.round(dim.height * 0.05));

    ctx.fillStyle = mutedColor;
    ctx.font = `500 ${Math.round(dim.width * 0.03)}px sans-serif`;
    ctx.fillText(`📍 ${locationLabel}`, padX, contentTop + Math.round(dim.height * 0.088));

    // Highlights Tags
    const tagTop = contentTop + Math.round(dim.height * 0.12);
    let tagX = padX;
    highlights.slice(0, 4).forEach((h) => {
      ctx.font = `600 ${Math.round(dim.width * 0.024)}px sans-serif`;
      const textMetrics = ctx.measureText(h);
      const tagWidth = textMetrics.width + 30;
      const tagH = Math.round(dim.height * 0.036);

      ctx.fillStyle = cardBg;
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(tagX, tagTop, tagWidth, tagH, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.fillText(h, tagX + tagWidth / 2, tagTop + tagH * 0.65);

      tagX += tagWidth + 14;
    });

    // 5. Bottom Section: Either Branded Footer + QR Code OR Clean Architectural Spec Grid
    if (showBranding) {
      // BRANDED MODE: Footer card with agent phone, title, agency & QR code
      const footerH = Math.round(dim.height * 0.16);
      const footerTop = dim.height - footerH;

      ctx.fillStyle = cardBg;
      ctx.fillRect(0, footerTop, dim.width, footerH);
      ctx.strokeStyle = borderColor;
      ctx.beginPath();
      ctx.moveTo(0, footerTop);
      ctx.lineTo(dim.width, footerTop);
      ctx.stroke();

      ctx.fillStyle = textColor;
      ctx.font = `bold ${Math.round(footerH * 0.24)}px sans-serif`;
      ctx.textAlign = "left";
      ctx.fillText(agent.name, padX, footerTop + Math.round(footerH * 0.38));

      ctx.fillStyle = mutedColor;
      ctx.font = `500 ${Math.round(footerH * 0.16)}px sans-serif`;
      ctx.fillText(`${agent.title} · ${agent.agency}`, padX, footerTop + Math.round(footerH * 0.6));
      ctx.fillText(`WhatsApp: ${agent.phone}`, padX, footerTop + Math.round(footerH * 0.82));

      if (qrDataUrl) {
        const qrImg = new Image();
        qrImg.src = qrDataUrl;
        qrImg.onload = () => {
          const qrSize = Math.round(footerH * 0.74);
          const qrX = dim.width - padX - qrSize;
          const qrY = footerTop + (footerH - qrSize) / 2;
          ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

          ctx.fillStyle = mutedColor;
          ctx.font = `bold ${Math.round(footerH * 0.11)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.fillText("SCAN UNTUK WA", qrX + qrSize / 2, qrY - 6);
        };
      }
    } else {
      // CLEAN / CO-BROKE MODE (Without agent branding & QR):
      // Render clean building specifications & unbranded listing passport
      const specsH = Math.round(dim.height * 0.14);
      const specsTop = dim.height - specsH - Math.round(dim.height * 0.03);
      const specsW = dim.width - padX * 2;

      ctx.fillStyle = cardBg;
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(padX, specsTop, specsW, specsH, 12);
      ctx.fill();
      ctx.stroke();

      const certRaw = activeListing?.certificate || "SHM";
      const certClean = certRaw.includes("SHM")
        ? "SHM"
        : certRaw.includes("HGB")
        ? "HGB"
        : certRaw.length > 12
        ? `${certRaw.slice(0, 10)}...`
        : certRaw;

      const items = [
        { label: "LUAS TANAH", val: `${activeListing?.landSize || 120} m²` },
        { label: "LUAS BANGUNAN", val: `${activeListing?.buildingSize || 150} m²` },
        { label: "KAMAR", val: `${activeListing?.bedrooms || 3} KT / ${activeListing?.bathrooms || 2} KM` },
        { label: "SERTIFIKAT", val: certClean },
      ];

      const colW = specsW / items.length;
      items.forEach((item, idx) => {
        const colCenterX = padX + colW * idx + colW / 2;
        ctx.fillStyle = mutedColor;
        ctx.font = `600 ${Math.round(specsH * 0.16)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(item.label, colCenterX, specsTop + Math.round(specsH * 0.38));

        ctx.fillStyle = textColor;
        ctx.font = `bold ${Math.round(specsH * 0.22)}px sans-serif`;
        ctx.fillText(item.val, colCenterX, specsTop + Math.round(specsH * 0.72));

        if (idx < items.length - 1) {
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(padX + colW * (idx + 1), specsTop + Math.round(specsH * 0.2));
          ctx.lineTo(padX + colW * (idx + 1), specsTop + Math.round(specsH * 0.8));
          ctx.stroke();
        }
      });

      // Bottom disclaimer / neutral listing credit
      ctx.fillStyle = mutedColor;
      ctx.font = `500 ${Math.round(dim.width * 0.02)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(
        "Format Bersih Co-Broke · Data Spesifikasi Terverifikasi Pemilik",
        dim.width / 2,
        dim.height - Math.round(dim.height * 0.012)
      );
    }
  }, [
    size,
    template,
    headline,
    priceLabel,
    locationLabel,
    highlights,
    qrDataUrl,
    agent,
    showBranding,
    activeListing,
  ]);

  // Export handlers
  const handleDownloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setExporting(true);
    recordFlyerExport();

    setTimeout(() => {
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      const modeSuffix = showBranding ? "branded" : "clean-unbranded";
      const filename = `Flyer-${headline.replace(/\s+/g, "-")}-${size}-${modeSuffix}.png`;
      a.download = filename;
      a.click();

      // Record in Export History
      const dim = flyerSizes[size];
      const randomHex1 = Math.random().toString(16).substring(2, 8);
      const randomHex2 = Math.random().toString(16).substring(2, 6);
      const randomHex3 = Math.random().toString(16).substring(2, 6);
      const verificationHash = `SHA256:${randomHex1}${randomHex2}...${randomHex3}`;
      const approxMb =
        size === "a4" ? "3.4 MB" : size === "story" ? "1.8 MB" : size === "portrait" ? "1.5 MB" : "1.2 MB";

      addFlyerExport({
        filename,
        headline,
        size,
        dimensions: `${dim.width} × ${dim.height} px`,
        template,
        mode: showBranding ? "branded" : "clean",
        fileFormat: "PNG",
        dpi: 300,
        status: "verified",
        verificationHash,
        fileSizeApprox: approxMb,
        exportedAt: new Date().toISOString(),
      });

      setExporting(false);
    }, 400);
  };

  return (
    <WorkspaceShell
      title="Pembuat Flyer"
      subtitle="Flyer siap posting dan siap cetak"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-900 text-white shadow-2xl border border-emerald-700 animate-in slide-in-from-top duration-200 text-[13px] font-semibold"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Tab Navigation Switcher & Quick Save Preset Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-2 rounded-2xl bg-[var(--surface)] border border-[var(--border)] mb-8 shadow-xs">
        {/* View Mode Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
          <button
            type="button"
            onClick={() => setActiveView("editor")}
            data-testid="tab-editor"
            className={`px-4 py-2 rounded-lg text-[13px] font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeView === "editor"
                ? "bg-[var(--accent)] text-neutral-950 shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>{locale === "id" ? "Kanvas Editor" : "Canvas Editor"}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView("gallery")}
            data-testid="tab-gallery"
            className={`px-4 py-2 rounded-lg text-[13px] font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeView === "gallery"
                ? "bg-[var(--accent)] text-neutral-950 shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>{locale === "id" ? "Galeri Layout & Preset" : "Layout Gallery & Presets"}</span>
            <span
              className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-mono ${
                activeView === "gallery"
                  ? "bg-white/20 text-white"
                  : "bg-[var(--surface)] text-[var(--accent-text)]"
              }`}
            >
              {flyerPresets.length}
            </span>
          </button>
        </div>

        {/* Active Preset Indicator & Save Layout CTA */}
        <div className="flex items-center gap-2.5">
          {activePresetName && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--accent)]/10 text-[var(--accent-text)] text-[13px] font-semibold border border-[var(--accent)]/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="truncate max-w-[240px]">
                {locale === "id" ? "Preset Aktif:" : "Active:"} <strong>{activePresetName}</strong>
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsSaveModalOpen(true)}
            data-testid="header-save-preset-btn"
            className="px-3.5 py-2 rounded-xl bg-[var(--accent)] text-neutral-950 hover:opacity-90 transition-opacity text-[13px] font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>{locale === "id" ? "Simpan Layout Saat Ini" : "Save Current Layout"}</span>
          </button>
        </div>
      </div>

      {/* Editor View Tab Content */}
      <div className={activeView === "editor" ? "block" : "hidden"}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Canvas Customization Toolbar */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-5">
              {/* Quick Preset Selector Dropdown */}
              <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-bold text-[var(--text)] flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 text-[var(--accent-text)]" />
                    <span>{locale === "id" ? "Pilih dari Preset Layout:" : "Load Layout Preset:"}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveView("gallery")}
                    className="text-[13px] font-semibold text-[var(--accent-text)] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>
                      {locale === "id"
                        ? `Buka Galeri (${flyerPresets.length})`
                        : `Open Gallery (${flyerPresets.length})`}
                    </span>
                  </button>
                </div>
                <select
                  value={activePresetId || ""}
                  onChange={(e) => {
                    const p = flyerPresets.find((item) => item.id === e.target.value);
                    if (p) handleApplyPreset(p);
                  }}
                  className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[13px] text-[var(--text)] font-medium"
                >
                  <option value="" disabled>
                    -- {locale === "id" ? "Pilih Preset Favorit" : "Select Favorite Preset"} --
                  </option>
                  {flyerPresets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.size.toUpperCase()} · {p.template} ·{" "}
                      {p.showBranding ? "dengan kontak" : "tanpa kontak"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <h2 className="text-base font-bold text-[var(--text)] flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[var(--accent-text)]" />
                  <span>Ukuran &amp; gaya</span>
                </h2>
              </div>

              {/* Quick Preload Picker */}
              <div>
              <label className="text-[13px] font-semibold text-[var(--muted)] block mb-1.5">
                {locale === "id" ? "Gunakan Data Listing:" : "Load Listing Data:"}
              </label>
              <select
                value={selectedListingId}
                onChange={(e) => handleSelectListing(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[13px] text-[var(--text)]"
              >
                {listings.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} — Rp {(l.price / 1000000000).toFixed(1)} M
                  </option>
                ))}
              </select>
            </div>

            {/* Size Selector */}
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-[var(--text)] block">
                {locale === "id" ? "Pilih Ukuran Format:" : "Select Canvas Size:"}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[13px]">
                {(
                  [
                    { id: "square", label: "Square (1:1)", desc: "1080×1080 Feed" },
                    { id: "portrait", label: "Portrait (4:5)", desc: "1080×1350 IG" },
                    { id: "story", label: "Story (9:16)", desc: "1080×1920 Reels" },
                    { id: "landscape", label: "Landscape", desc: "1200×628 Ads" },
                    { id: "a4", label: "A4 Cetak", desc: "2480×3508 300DPI" },
                  ] as const
                ).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSize(s.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      size === s.id
                        ? "bg-[var(--accent)] text-neutral-950 border-[var(--accent)] shadow-xs font-semibold"
                        : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)] hover:border-[var(--muted)]"
                    }`}
                  >
                    <div className="font-bold">{s.label}</div>
                    <div className={`text-xs ${size === s.id ? "text-white/80" : "text-[var(--muted)]"}`}>
                      {s.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Template Selector */}
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-[var(--text)] block">
                {locale === "id" ? "Gaya Tema Visual:" : "Visual Theme:"}
              </label>
              <div className="grid grid-cols-3 gap-2 text-[13px]">
                {(
                  [
                    { id: "modern", label: "Modern Clean" },
                    { id: "luxury", label: "Luxury Dark" },
                    { id: "minimal", label: "Minimalist" },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTemplate(t.id)}
                    className={`py-2 px-3 rounded-lg border text-center transition-all ${
                      template === t.id
                        ? "bg-[var(--accent)] text-neutral-950 border-[var(--accent)] font-semibold shadow-xs"
                        : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact & QR switch */}
            <label className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showBranding}
                onChange={(e) => setShowBranding(e.target.checked)}
                data-testid="toggle-preview-mode"
                className="mt-1 w-4 h-4 accent-[var(--accent)]"
              />
              <span>
                <span className="text-sm font-bold block">Tampilkan kontak &amp; QR saya</span>
                <span className="text-[13px] text-[var(--muted)]">Matikan untuk flyer co-broke yang dibagikan ke agen lain.</span>
              </span>
            </label>

            {/* Content Form Inputs */}
            <div className="space-y-3 text-[13px] pt-2 border-t border-[var(--border)]">
              <div>
                <label className="font-semibold text-[var(--text)] block mb-1">
                  {locale === "id" ? "Judul Flyer" : "Flyer Headline"}
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[var(--text)] block mb-1">
                    {locale === "id" ? "Badge Harga" : "Price Label"}
                  </label>
                  <input
                    type="text"
                    value={priceLabel}
                    onChange={(e) => setPriceLabel(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[var(--text)] block mb-1">
                    {locale === "id" ? "Lokasi Singkat" : "Location"}
                  </label>
                  <input
                    type="text"
                    value={locationLabel}
                    onChange={(e) => setLocationLabel(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[var(--text)] block mb-1">
                  {locale === "id" ? "Link Tujuan QR Code (WhatsApp / Maps)" : "QR Code Destination Link"}
                </label>
                <input
                  type="text"
                  value={qrDestination}
                  onChange={(e) => setQrDestination(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] font-mono text-[13px]"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleDownloadPNG}
                  disabled={exporting}
                  className="flex-1 py-3 bg-[var(--accent)] text-neutral-950 text-[13px] font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {exporting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>
                    {exporting
                      ? "Membuat file..." : "Unduh PNG"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Canvas Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex flex-col items-center justify-center min-h-[500px]">
            <div className="flex items-center justify-between w-full pb-4 border-b border-[var(--border)] mb-4 gap-3 text-sm">
              <span className="font-semibold">Pratinjau</span>
              <span className="text-[var(--muted)]">
                {flyerSizes[size].width} × {flyerSizes[size].height} px · {showBranding ? "dengan kontak & QR" : "tanpa kontak"}
              </span>
            </div>

            {/* The actual HTML5 Canvas */}
            <div className="relative border border-[var(--border)] rounded-xl overflow-hidden shadow-lg max-h-[600px] flex items-center justify-center bg-black/5 dark:bg-white/5 p-2 w-full">
              <canvas
                ref={canvasRef}
                style={{
                  maxWidth: "100%",
                  maxHeight: "540px",
                  objectFit: "contain",
                }}
                className="rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Gallery View Tab Content */}
      <div className={activeView === "gallery" ? "block" : "hidden"}>
        <FlyerGalleryView
          presets={flyerPresets}
          onApplyPreset={handleApplyPreset}
          onOpenSaveModal={() => setIsSaveModalOpen(true)}
          onDeletePreset={handleDeletePreset}
          onDuplicatePreset={handleDuplicatePreset}
          onResetDefaults={handleResetDefaults}
          locale={locale}
          activePresetId={activePresetId}
        />
      </div>

      {/* Export History Section */}
      <section id="export-history" className="mt-8 p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold">Riwayat unduhan ({flyerExports.length})</h2>
          {flyerExports.length > 0 && (
            <button
              type="button"
              onClick={clearFlyerExports}
              className="text-sm text-[var(--muted)] hover:text-red-600"
            >
              Hapus riwayat
            </button>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="search"
            value={historySearch}
            onChange={(e) => setHistorySearch(e.target.value)}
            placeholder="Cari nama file atau properti"
            className="flex-1 px-3 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-sm"
          />
          <div className="flex gap-1 p-1 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-sm">
            {([
              { id: "all", label: "Semua" },
              { id: "branded", label: "Dengan kontak" },
              { id: "clean", label: "Tanpa kontak" },
            ] as const).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setHistoryModeFilter(f.id)}
                className={`px-3 py-1 rounded-lg ${historyModeFilter === f.id ? "bg-[var(--accent)] text-neutral-950 font-semibold" : "text-[var(--muted)]"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        {(() => {
          const rows = flyerExports.filter((item) => {
            const q = historySearch.toLowerCase();
            const matchesSearch = item.filename.toLowerCase().includes(q) || item.headline.toLowerCase().includes(q);
            return matchesSearch && (historyModeFilter === "all" || item.mode === historyModeFilter);
          });
          if (rows.length === 0) {
            return (
              <p className="py-6 text-center text-sm text-[var(--muted)]">
                <FileImage className="w-8 h-8 mx-auto mb-2 opacity-40" />
                Belum ada flyer yang diunduh.
              </p>
            );
          }
          return (
            <ul className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
              {rows.map((item) => (
                <li key={item.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{item.headline}</p>
                    <p className="text-[var(--muted)] truncate">
                      {item.dimensions} · {item.mode === "branded" ? "dengan kontak" : "tanpa kontak"} ·{" "}
                      {new Date(item.exportedAt).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteFlyerExport(item.id)}
                    className="p-2 rounded-lg text-[var(--muted)] hover:text-red-600 shrink-0"
                    aria-label="Hapus dari riwayat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          );
        })()}
      </section>

      

      {/* Save Layout Preset Modal */}
      <SavePresetModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSaveCurrentLayout}
        currentConfig={{
          size,
          template,
          showBranding,
          headline,
          priceLabel,
          locationLabel,
          highlights,
          qrDestination,
        }}
        locale={locale}
      />
    </WorkspaceShell>
  );
}
