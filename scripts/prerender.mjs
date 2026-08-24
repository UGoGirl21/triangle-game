import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(projectRoot, "dist");
const siteUrl = "https://triangle-game-one.vercel.app";
const pages = {
  "/how-to-play": [
    "게임 방법 | 삼각 땅따먹기",
    "삼각 땅따먹기의 선 연결 규칙, 유효하지 않은 선, 점수 계산과 게임 모드를 자세히 알아보세요.",
  ],
  "/strategy": [
    "공략과 전략 | 삼각 땅따먹기",
    "즉시 득점, 영역 분할, 연속 득점과 후반 계산 등 더 많은 삼각형을 차지하기 위한 전략을 알아보세요.",
  ],
  "/daily-challenge": [
    "오늘의 챌린지 | 삼각 땅따먹기",
    "모두 같은 점 배치와 AI 난이도로 하루 한 번 플레이하고 점수와 완료 시간을 비교해 보세요.",
  ],
  "/faq": [
    "자주 묻는 질문 | 삼각 땅따먹기",
    "게임 규칙, 온라인 방, 오늘의 챌린지, 랭킹과 데이터 저장에 관한 답변을 확인하세요.",
  ],
  "/about": [
    "게임 소개 | Triangle Territory",
    "직접 만든 브라우저 전략 게임 Triangle Territory의 특징, 제작 배경과 운영 원칙을 소개합니다.",
  ],
  "/privacy": [
    "개인정보처리방침 | Triangle Territory",
    "Triangle Territory에서 처리하는 게임 기록, 브라우저 저장소, 외부 서비스와 이용자 선택을 안내합니다.",
  ],
  "/terms": [
    "이용약관 | Triangle Territory",
    "Triangle Territory 서비스 이용 조건, 이용자 책임, 랭킹 기록과 지식재산권 안내입니다.",
  ],
  "/contact": [
    "문의 | Triangle Territory",
    "Triangle Territory 오류 제보, 기록 삭제와 개인정보 관련 문의 방법을 확인하세요.",
  ],
};

function escapeHtmlAttribute(value) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
}

function replaceAttribute(html, selectorPattern, attribute, value) {
  return html.replace(selectorPattern, (tag) => {
    const escaped = escapeHtmlAttribute(value);
    const attributePattern = new RegExp(`(${attribute}=["'])[^"']*(["'])`);
    return attributePattern.test(tag)
      ? tag.replace(attributePattern, `$1${escaped}$2`)
      : tag.replace(/\s*\/$|>$/, (ending) => ` ${attribute}="${escaped}"${ending}`);
  });
}

const template = await readFile(path.join(distDir, "index.html"), "utf8");
const vite = await createServer({ root: projectRoot, server: { middlewareMode: true }, appType: "custom" });

try {
  const { default: PrerenderApp } = await vite.ssrLoadModule("/src/PrerenderApp.jsx");

  for (const [route, [title, description]] of Object.entries(pages)) {
    const canonical = `${siteUrl}${route}`;
    const appHtml = renderToStaticMarkup(React.createElement(PrerenderApp, { path: route }));
    let html = template
      .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
      .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

    html = replaceAttribute(html, /<meta\s+name=["']description["'][^>]*>/i, "content", description);
    html = replaceAttribute(html, /<meta\s+name=["']robots["'][^>]*>/i, "content", "index, follow");
    html = replaceAttribute(html, /<link\s+rel=["']canonical["'][^>]*>/i, "href", canonical);
    html = replaceAttribute(html, /<meta\s+property=["']og:title["'][^>]*>/i, "content", title);
    html = replaceAttribute(html, /<meta\s+property=["']og:description["'][^>]*>/i, "content", description);
    html = replaceAttribute(html, /<meta\s+property=["']og:url["'][^>]*>/i, "content", canonical);
    html = replaceAttribute(html, /<meta\s+name=["']twitter:title["'][^>]*>/i, "content", title);
    html = replaceAttribute(html, /<meta\s+name=["']twitter:description["'][^>]*>/i, "content", description);

    const outputDir = path.join(distDir, route.slice(1));
    await mkdir(outputDir, { recursive: true });
    await writeFile(path.join(outputDir, "index.html"), html);
  }
} finally {
  await vite.close();
}
