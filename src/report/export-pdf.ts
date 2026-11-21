import {PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage} from 'pdf-lib';

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
  const normalSpace = font.widthOfTextAtSize(' ', size);
  if (gap > normalSpace * 2.5) {
    page.drawText(line, {x: margin, y, font, size, color: charcoal});
    return;
  }

  let x = margin;
  words.forEach((word, index) => {
    page.drawText(word, {x, y, font, size, color: charcoal});
    x += (widths[index] ?? 0) + gap;
  });
}

export async function downloadReport(report: HTMLElement, assessmentId: string) {
  const pdf = await PDFDocument.create();
  pdf.setTitle('Silverspark Compass Assessment Report');
  pdf.setAuthor('Silverspark Consulting');
  pdf.setSubject('Self-reported AI readiness assessment');
  const [regular, bold] = await Promise.all([
    pdf.embedFont(StandardFonts.Helvetica),
    pdf.embedFont(StandardFonts.HelveticaBold),
  ]);
  const characters = new Set(regular.getCharacterSet());
  const encode = (raw: string) => Array.from(raw, (letter) => {
    if (characters.has(letter.codePointAt(0) ?? 0)) return letter;
    const fallback = letter.normalize('NFKD').replace(/\p{Mark}/gu, '');
    if (fallback && Array.from(fallback).every((value) => characters.has(value.codePointAt(0) ?? 0))) return fallback;
    return `[U+${(letter.codePointAt(0) ?? 0).toString(16).toUpperCase()}]`;
  }).join('');

  function addPage() {
    const page = pdf.addPage([pageWidth, pageHeight]);
    page.drawText('SILVERSPARK COMPASS', {x: margin, y: pageHeight - 39, size: 10, font: bold, color: navy});
    page.drawLine({start: {x: margin, y: pageHeight - 49}, end: {x: pageWidth - margin, y: pageHeight - 49}, thickness: 0.8, color: lineColor});
    return page;
  }

  let page = addPage();
  let cursor = pageHeight - 80;
  function ensureSpace(height: number) {
    if (cursor - height >= 54) return;
    page = addPage();
    cursor = pageHeight - 73;
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

  drawBlock('AI readiness assessment', bold, 23, true);
  drawBlock(readText(report.querySelector('.report-disclaimer')), regular, 10);
  for (const section of report.querySelectorAll('.report-section')) {
    cursor -= 7;
    drawBlock(readText(section.querySelector('summary h4')), bold, 14, true);
    const content = section.querySelector('.report-section-content');
    for (const element of content?.querySelectorAll(reportBlockSelector) ?? []) {
      const text = blockText(element);
      const emphasize = element.matches('h3, h5, dt, .report-score-value');
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
