import {PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage} from 'pdf-lib';

import logoData from '../assets/silverspark-mark-print.png?inline';
import type {TrafficLightSignal} from '../domain/report-guidance';
import type {ReadinessResult} from '../domain/evaluate';

const white = rgb(1, 1, 1);
const pale = rgb(0.95, 0.96, 0.97);
const silver = rgb(0.72, 0.77, 0.82);
const accent = rgb(0.60, 0.46, 0.23);
const lampColors = {
  red: rgb(1, 0.51, 0.46),
  amber: rgb(1, 0.80, 0.33),
  green: rgb(0.40, 0.87, 0.68),
};
const lampOrder = ['red', 'amber', 'green'] as const;

const pageWidth = 595.28;
const pageHeight = 841.89;
const margin = 48;
const contentWidth = pageWidth - margin * 2;
const navy = rgb(0.05, 0.09, 0.16);
const charcoal = rgb(0.16, 0.20, 0.25);
const muted = rgb(0.31, 0.37, 0.44);
const lineColor = rgb(0.83, 0.86, 0.89);
const reportBlockSelector = 'h3, h5, p, li, dt, dd, .report-dimension-header';

function readText(element: Element | null) {
  return element?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
}

function blockText(element: Element) {
  if (element.classList.contains('report-dimension-header')) {
    return Array.from(element.children, readText).join(' · ');
  }
  if (element.tagName !== 'LI') return readText(element);
  const item = element.cloneNode(true) as Element;
  item.querySelectorAll('ul, ol, div, p').forEach((child) => child.remove());
  const list = element.parentElement;
  const prefix = list?.tagName === 'OL' ? `${Array.from(list.children).indexOf(element) + 1}. ` : '• ';
  return prefix + readText(item);
}

function wrap(text: string, width: number, font: PDFFont, size: number) {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= width) {
      line = next;
      continue;
    }
    if (line) lines.push(line);
    line = '';
    for (const letter of word) {
      if (font.widthOfTextAtSize(line + letter, size) > width) {
        lines.push(line);
        line = '';
      }
      line += letter;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawJustifiedLine(page: PDFPage, line: string, y: number, font: PDFFont, size: number) {
  const words = line.split(' ');
  if (words.length < 2) {
    page.drawText(line, {x: margin, y, font, size, color: charcoal});
    return;
  }
  const widths = words.map((word) => font.widthOfTextAtSize(word, size));
  const gap = (contentWidth - widths.reduce((sum, width) => sum + width, 0)) / (words.length - 1);
  let x = margin;
  words.forEach((word, index) => {
    page.drawText(word, {x, y, font, size, color: charcoal});
    x += (widths[index] ?? 0) + gap;
  });
}

export async function downloadReport(report: HTMLElement, assessmentId: string, signalColor: TrafficLightSignal['color'], dimensions: ReadinessResult['dimensions']) {
  const pdf = await PDFDocument.create();
  pdf.setTitle('Silverspark Compass Assessment Report');
  pdf.setAuthor('Silverspark Consulting');
  pdf.setSubject('Self-reported AI readiness assessment');
  const [regular, bold] = await Promise.all([
    pdf.embedFont(StandardFonts.Helvetica),
    pdf.embedFont(StandardFonts.HelveticaBold),
  ]);
  const logo = await pdf.embedPng(logoData);
  const characters = new Set(regular.getCharacterSet());
  const encode = (raw: string) => Array.from(raw, (letter) => {
    if (characters.has(letter.codePointAt(0) ?? 0)) return letter;
    const fallback = letter.normalize('NFKD').replace(/\p{Mark}/gu, '');
    if (fallback && Array.from(fallback).every((value) => characters.has(value.codePointAt(0) ?? 0))) return fallback;
    return `[U+${(letter.codePointAt(0) ?? 0).toString(16).toUpperCase()}]`;
  }).join('');

  function addPage() {
    const page = pdf.addPage([pageWidth, pageHeight]);
    const headerY = pageHeight - 67;
    page.drawRectangle({x: 0, y: headerY, width: pageWidth, height: 67, color: navy});
    page.drawRectangle({x: margin, y: headerY + 11, width: 42, height: 44, color: white});
    const mark = logo.scaleToFit(30, 34);
    page.drawImage(logo, {x: margin + (42 - mark.width) / 2, y: headerY + (66 - mark.height) / 2, ...mark});
    page.drawText('Silverspark Consulting', {x: margin + 55, y: headerY + 35, size: 15, font: bold, color: white});
    page.drawText('Strategy in Action', {x: margin + 55, y: headerY + 19, size: 10, font: regular, color: silver});
    const name = 'COMPASS   /   AI READINESS';
    page.drawText(name, {x: pageWidth - margin - bold.widthOfTextAtSize(name, 9), y: headerY + 28, size: 9, font: bold, color: white});
    page.drawRectangle({x: 0, y: headerY - 2, width: pageWidth, height: 2, color: accent});
    return page;
  }

  let page = addPage();
  let cursor = pageHeight - 102;
  function ensureSpace(height: number) {
    if (cursor - height >= 54) return;
    page = addPage();
    cursor = pageHeight - 102;
  }

  function drawBlock(raw: string, font: PDFFont, size: number, heading = false) {
    const block = encode(raw);
    const leading = size * 1.43;
    const lines = wrap(block, contentWidth, font, size);
    ensureSpace(leading * Math.min(2, lines.length) + (heading ? 20 : 0));
    lines.forEach((line, index) => {
      ensureSpace(leading);
      if (!heading && index < lines.length - 1) {
        drawJustifiedLine(page, line, cursor, font, size);
      } else {
        page.drawText(line, {x: margin, y: cursor, font, size, color: heading ? navy : charcoal});
      }
      cursor -= leading;
    });
    cursor -= heading ? 4 : 5;
  }

  function sectionHeading(title: string) {
    ensureSpace(62);
    cursor -= 9;
    page.drawLine({start: {x: margin, y: cursor + 9}, end: {x: margin + contentWidth, y: cursor + 9}, thickness: 0.8, color: lineColor});
    cursor -= 9;
    drawBlock(title, bold, 15, true);
  }

  function iconHeading(label: string, kind: 'arrow' | 'safety') {
    ensureSpace(52);
    const x = margin + 9;
    const y = cursor + 3;
    page.drawCircle({x, y, size: 9, color: pale});
    const line = (ax: number, ay: number, bx: number, by: number) =>
      page.drawLine({start: {x: x + ax, y: y + ay}, end: {x: x + bx, y: y + by}, thickness: 1.2, color: navy});
    if (kind === 'arrow') {
      line(-4, 0, 4, 0);
      line(1, 3, 4, 0);
      line(1, -3, 4, 0);
    } else {
      line(-5, -3, 0, 5);
      line(0, 5, 5, -3);
      line(5, -3, -5, -3);
      line(0, 0, 0, 2);
    }
    page.drawText(label, {x: margin + 24, y: cursor, font: bold, size: 11, color: navy});
    cursor -= 25;
  }

  const summary = report.querySelector('.report-overview');
  const signal = report.querySelector('.readiness-signal');
  drawBlock('AI readiness assessment', bold, 28, true);
  drawBlock(readText(report.querySelector('.report-disclaimer')), regular, 10);
  cursor -= 10;
  const cardY = cursor - 72;
  page.drawRectangle({x: margin, y: cardY, width: contentWidth, height: 76, color: pale});
  page.drawText(readText(summary?.querySelector('.result-label') ?? null).toUpperCase(), {x: margin + 16, y: cardY + 52, size: 9, font: bold, color: muted});
  page.drawText(encode(readText(summary?.querySelector('.report-score-value') ?? null)), {x: margin + 16, y: cardY + 18, size: 23, font: bold, color: navy});

  const lampX = pageWidth - margin - 101;
  const lampY = cardY + 39;
  page.drawRectangle({x: lampX, y: lampY - 16, width: 60, height: 32, color: navy});
  for (const x of [lampX, lampX + 60]) page.drawCircle({x, y: lampY, size: 16, color: navy});
  lampOrder.forEach((color, index) => {
    const x = lampX + 4 + 26 * index;
    const active = color === signalColor;
    if (active) page.drawCircle({x, y: lampY, size: 12, borderWidth: 1, borderColor: white});
    page.drawCircle({x, y: lampY, size: active ? 8.9 : 6, color: active ? lampColors[color] : silver, opacity: active ? 1 : 0.36});
    if (active) page.drawCircle({x: x - 2, y: lampY + 2.8, size: 2, color: white, opacity: 0.65});
  });
  cursor = cardY - 24;
  drawBlock(readText(signal?.querySelector('h3') ?? null), bold, 15, true);
  for (const item of signal?.querySelectorAll('p:not(.eyebrow)') ?? []) drawBlock(readText(item), regular, 10.5);
  for (const item of summary?.querySelectorAll('.report-score p:not(.result-label, .report-score-value)') ?? []) drawBlock(readText(item), regular, 10.5);

  cursor -= 10;
  iconHeading('Recommended next step', 'arrow');
  drawBlock(readText(summary?.querySelector('.report-next-step h5') ?? null), bold, 17, true);
  drawBlock(readText(summary?.querySelector('.report-next-step p:last-child') ?? null), regular, 11);
  const firstAction = report.querySelector('#report-practical-recommendation-title')?.closest('details')?.querySelector('.report-section-content p:nth-child(3)');
  if (firstAction) drawBlock(readText(firstAction), regular, 11);
  cursor -= 10;
  iconHeading('Safety checks', 'safety');
  for (const item of report.querySelectorAll('.report-safety li, .report-safety p')) drawBlock(blockText(item), regular, 10.5);

  page = addPage();
  cursor = pageHeight - 102;
  const chart = report.querySelector('#report-seven-dimension-results-title')?.closest('details');
  sectionHeading('Use-case guidance and feasibility');
  for (const item of report.querySelectorAll('.decision-summary p')) {
    const label = readText(item.querySelector('strong'));
    drawBlock(label + ': ' + readText(item).slice(label.length).trim(), regular, 11);
  }
  for (const item of report.querySelectorAll('.decision-summary li')) drawBlock(readText(item), regular, 11);
  sectionHeading('Seven dimensions of readiness');
  drawBlock('The dark bar shows the confirmed score. A lighter extension shows how far the score could rise when unknown answers are confirmed.', regular, 10.5);
  for (const row of chart?.querySelectorAll<HTMLElement>('[data-dimension]') ?? []) {
    const metric = dimensions[row.dataset.dimension as keyof typeof dimensions];
    const label = readText(row.querySelector('.report-dimension-header span'));
    const value = readText(row.querySelector('.report-dimension-header span:last-child'));
    ensureSpace(34);
    page.drawText(encode(label), {x: margin, y: cursor, size: 11, font: bold, color: navy});
    const detail = encode(value);
    page.drawText(detail, {x: pageWidth - margin - regular.widthOfTextAtSize(detail, 10), y: cursor, size: 10, font: regular, color: muted});
    const bar = (width: number, color: typeof navy) => {
      if (width > 0) page.drawRectangle({x: margin, y: cursor - 12, width, height: 5, color});
    };
    bar(contentWidth, pale);
    bar(contentWidth * metric.upper / 4, silver);
    bar(contentWidth * metric.lower / 4, navy);
    cursor -= 32;
  }

  for (const section of report.querySelectorAll('.report-section')) {
    if (section === chart || section.querySelector('.report-overview')) continue;
    sectionHeading(readText(section.querySelector('summary h4')));
    for (const element of section.querySelectorAll('.report-section-content :is(' + reportBlockSelector + ')')) {
      const text = blockText(element);
      const emphasize = element.matches('h3, h5, dt');
      if (text) drawBlock(text, emphasize ? bold : regular, 10.5, emphasize);
    }
  }

  const pages = pdf.getPages();
  pages.forEach((item, index) => {
    item.drawLine({start: {x: margin, y: 39}, end: {x: pageWidth - margin, y: 39}, thickness: 0.8, color: lineColor});
    item.drawText('Self-reported assessment', {x: margin, y: 24, size: 8.5, font: regular, color: muted});
    const counter = `${index + 1} / ${pages.length}`;
    item.drawText(counter, {x: pageWidth - margin - regular.widthOfTextAtSize(counter, 8.5), y: 24, size: 8.5, font: regular, color: muted});
  });

  const bytes = new Uint8Array(await pdf.save());
  const url = URL.createObjectURL(new Blob([bytes], {type: 'application/pdf'}));
  const link = document.createElement('a');
  link.href = url;
  link.download = `Silverspark-Compass-${assessmentId}.pdf`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30000);
}
