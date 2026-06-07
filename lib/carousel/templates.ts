import {
  CAROUSEL_HANDWRITTEN_FONT,
  CAROUSEL_PORTRAIT_SIZE,
} from "@/lib/config";
import type { CarouselSlideLayout } from "@/lib/types";

const { width: W, height: H } = CAROUSEL_PORTRAIT_SIZE;

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 6);
}

export function doodleArrows(): string {
  return `
    <path d="M120,280 Q180,240 240,200" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M240,200 L225,205 M240,200 L232,215" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M860,400 Q800,360 720,320" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M180,1100 Q120,1050 80,980" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.8"/>
    <circle cx="950" cy="180" r="28" stroke="white" stroke-width="2" fill="none" opacity="0.6"/>
    <path d="M950,152 L950,208 M922,180 L978,180" stroke="white" stroke-width="2" opacity="0.6"/>
  `;
}

export function gradientBackgroundSvg(layout: CarouselSlideLayout): string {
  if (layout === "split_before_after") {
    return `
      <rect width="${W}" height="${H / 2}" fill="#3d4f5f"/>
      <rect y="${H / 2}" width="${W}" height="${H / 2}" fill="#5c4a3a"/>
    `;
  }
  const gradients: Record<string, string> = {
    template_content:
      "linear-gradient(160deg, #1e3a5f 0%, #0a66c2 45%, #1e293b 100%)",
    portrait_cover:
      "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%)",
    portrait_cta:
      "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)",
    portrait_all:
      "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.6) 100%)",
  };
  const grad = gradients[layout] ?? gradients.template_content;
  return `<rect width="${W}" height="${H}" fill="url(#bgGrad)"/>
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#1e3a5f"/>
        <stop offset="50%" style="stop-color:#0a66c2"/>
        <stop offset="100%" style="stop-color:#1e293b"/>
      </linearGradient>
    </defs>`;
}

export function buildSlideOverlaySvg(input: {
  title: string;
  body: string;
  layout: CarouselSlideLayout;
  handle?: string;
  slideIndex: number;
  totalSlides: number;
}): string {
  const titleLines = wrapText(input.title, 22);
  const bodyLines = wrapText(input.body, 28);
  const font = escapeXml(CAROUSEL_HANDWRITTEN_FONT);

  let titleY = input.layout === "split_before_after" ? 120 : 180;
  let bodyStartY = titleY + titleLines.length * 52 + 20;

  const titleTspans = titleLines
    .map(
      (line, i) =>
        `<tspan x="80" dy="${i === 0 ? 0 : 52}">${escapeXml(line)}</tspan>`
    )
    .join("");

  const bodyTspans = bodyLines
    .map(
      (line, i) =>
        `<tspan x="80" dy="${i === 0 ? 0 : 36}">${escapeXml(line)}</tspan>`
    )
    .join("");

  const splitLabels =
    input.layout === "split_before_after"
      ? `
    <text x="80" y="340" font-family="${font}" font-size="56" fill="#facc15" font-weight="bold">before</text>
    <text x="80" y="${H / 2 + 80}" font-family="${font}" font-size="56" fill="#facc15" font-weight="bold">after</text>
    <line x1="60" y1="${H / 2}" x2="${W - 60}" y2="${H / 2}" stroke="white" stroke-width="2" opacity="0.4"/>
  `
      : "";

  const handleText = input.handle
    ? `<text x="${W / 2}" y="${H - 60}" text-anchor="middle" font-family="${font}" font-size="36" fill="white" opacity="0.9">${escapeXml(input.handle.startsWith("@") ? input.handle : `@${input.handle}`)}</text>`
    : "";

  const swipeHint =
    input.slideIndex === 0
      ? `<text x="${W - 100}" y="${H - 80}" font-family="sans-serif" font-size="24" fill="white" opacity="0.7">Swipe →</text>`
      : "";

  const counter = `<text x="${W - 80}" y="50" font-family="sans-serif" font-size="22" fill="white" opacity="0.6">${input.slideIndex + 1}/${input.totalSlides}</text>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="transparent"/>
  ${doodleArrows()}
  ${splitLabels}
  ${counter}
  <text x="80" y="${titleY}" font-family="${font}" font-size="64" fill="white" font-weight="bold" stroke="rgba(0,0,0,0.35)" stroke-width="2" paint-order="stroke">
    ${titleTspans}
  </text>
  <text x="80" y="${bodyStartY}" font-family="sans-serif" font-size="32" fill="white" opacity="0.95">
    ${bodyTspans}
  </text>
  ${handleText}
  ${swipeHint}
</svg>`;
}

export function usesPortraitBackground(
  layout: CarouselSlideLayout,
  hasPortrait: boolean
): boolean {
  if (!hasPortrait) return false;
  return (
    layout === "portrait_cover" ||
    layout === "portrait_cta" ||
    layout === "portrait_all"
  );
}
