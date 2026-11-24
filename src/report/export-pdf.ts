import type {ReportContent} from './report-content';
import {PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage} from 'pdf-lib';

import logoData from '../assets/silverspark-mark-print.png?inline';

const white = rgb(1, 1, 1);
const pale = rgb(0.95, 0.96, 0.97);
const silver = rgb(0.72, 0.77, 0.82);
const accent = silver;
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

export async function createReportFile(content: ReportContent) {
  const {reportGuidance, concerns, areas} = content;
  const {signal} = reportGuidance;
  const pdf = await PDFDocument.create();
  pdf.setTitle('Silverspark Compass Assessment Report');
  pdf.setAuthor('Silverspark Consulting');
  pdf.setSubject('Self-reported AI readiness assessment ' + content.assessmentId);
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

  drawBlock('Executive Decision', bold, 28, true);
  drawBlock(content.business.map(row => row.value).join('  /  '), regular, 11);
  drawBlock(content.disclaimer + '. Weights and thresholds are provisional.', regular, 10);
  cursor -= 10;
  const cardY = cursor - 72;
  page.drawRectangle({x: margin, y: cardY, width: contentWidth, height: 76, color: pale});
  page.drawText(reportGuidance.scoreLabel.toUpperCase(), {x: margin + 16, y: cardY + 52, size: 9, font: bold, color: muted});
  page.drawText(encode(reportGuidance.scoreText), {x: margin + 16, y: cardY + 18, size: 23, font: bold, color: navy});

  const lampX = pageWidth - margin - 101;
  const lampY = cardY + 39;
  page.drawRectangle({x: lampX, y: lampY - 16, width: 60, height: 32, color: navy});
  for (const x of [lampX, lampX + 60]) page.drawCircle({x, y: lampY, size: 16, color: navy});
  lampOrder.forEach((color, index) => {
    const x = lampX + 4 + 26 * index;
    const active = color === signal.color;
    if (active) page.drawCircle({x, y: lampY, size: 12, borderWidth: 1, borderColor: white});
    page.drawCircle({x, y: lampY, size: active ? 8.9 : 6, color: active ? lampColors[color] : silver, opacity: active ? 1 : 0.36});
    if (active) page.drawCircle({x: x - 2, y: lampY + 2.8, size: 2, color: white, opacity: 0.65});
  });
  cursor = cardY - 24;
  drawBlock(signal.label + ': ' + signal.title, bold, 15, true);
  drawBlock(signal.description, regular, 10.5);
  drawBlock(content.coverage, regular, 10.5);
  if (reportGuidance.scoreNote) drawBlock(reportGuidance.scoreNote, regular, 10.5);

  iconHeading('Use-case guidance and feasibility', 'safety');
  drawBlock(content.executiveDirection, regular, 11);
  for (const {label, value} of content.decisions) drawBlock(label + ': ' + value, bold, 11);
  for (const concern of concerns.slice(0, 2)) drawBlock(concern, regular, 11);
  iconHeading('Recommended next step', 'arrow');
  drawBlock(reportGuidance.primaryPathLabel, bold, 15, true);
  if (reportGuidance.firstActionLabel) drawBlock('Start here. ' + reportGuidance.firstActionLabel, regular, 11);
  if (!concerns.length) drawBlock(content.opportunity, regular, 11);

  drawBlock(content.capability, regular, 11);
  content.benefit.forEach(line => drawBlock(line, regular, 10.5));

  function dimensionChart() {
  ensureSpace(170);
  sectionHeading('Readiness by dimension');
  const chartY=cursor;
  const half=(contentWidth-24)/2;
  areas.forEach(({label, lower, upper, scoreText}, i) => {
    const x=margin+(i%2)*(half+24);
    const y=chartY-Math.floor(i/2)*29;
    const percent = encode(scoreText);
    page.drawText(encode(label),{x,y,font:bold,size:10,color:navy});
    page.drawText(percent,{x:x+half-regular.widthOfTextAtSize(percent,10),y,font:regular,size:10,color:muted});
    for(const [fraction,color] of [[1,pale],[upper/100,silver],[lower/100,navy]] as const) {
      if(fraction>0) page.drawRectangle({x,y:y-10,width:half*fraction,height:4,color});
    }
  });
  cursor=chartY-Math.ceil(areas.length/2)*29;
  if (areas.some(area => area.upper > area.lower)) drawBlock('Silver extensions show uncertainty from unknown practices.', regular, 9);
  }
  function openChapter(title: string) {
    page = addPage();
    cursor = pageHeight - 111;
    drawBlock(title, bold, 26, true);
    cursor -= 9;
  }

  openChapter('Priority Action Plan');
  if (!content.actions.length) drawBlock(content.noActions, regular, 10);
  for (const [index, action] of content.actions.entries()) {
    const titleSize = 15;
    const titleLines = wrap(encode(action.title), contentWidth - 82, bold, titleSize);
    const openerHeight = Math.max(51, 20 + titleLines.length * 17);
    const paragraphHeight = action.paragraphs.reduce((height, p) =>
      height + wrap(encode(p), contentWidth, regular, 10.5).length * 15.1 + 5, 0);
    ensureSpace(openerHeight + paragraphHeight + 15);
    page.drawLine({start:{x:margin,y:cursor+4},end:{x:pageWidth-margin,y:cursor+4},thickness:0.8,color:silver});
    page.drawRectangle({x:margin,y:cursor-41,width:62,height:41,color:navy});
    page.drawSvgPath(action.illustration, {x:margin+7,y:cursor-2,scale:.75,borderWidth:1.8,borderColor:white});
    page.drawText('PRIORITY ' + (index + 1) + '   /   ' + action.area.toUpperCase(),
      {x:margin+75,y:cursor-10,font:bold,size:8.5,color:muted});
    titleLines.forEach((line, i) => page.drawText(line,
      {x:margin+75,y:cursor-29-i*17,font:bold,size:titleSize,color:navy}));
    cursor -= openerHeight;
    for (const [i, paragraph] of action.paragraphs.entries()) {
      if (i === action.paragraphs.length - 1) {
        const height = wrap(encode(paragraph),contentWidth,regular,10.5).length * 15.1;
        page.drawRectangle({x:margin-5,y:cursor-height+9,width:contentWidth+10,height:height+3,color:pale});
      }
      drawBlock(paragraph, regular, 10.5);
    }
    cursor -= 12;
  }

  openChapter('Evidence & Methodology');
  dimensionChart();
  drawBlock(content.method, regular, 11);
  sectionHeading('Decision inputs');
  for (const {label,value} of content.useContext) drawBlock(label + ': ' + value, regular, 10.5);
  drawBlock(content.coverage, bold, 12, true);
  const metaText = content.metadata.map(({label, value}) => label + ': ' + value).join('  |  ');
  const businessText = content.business.map(({label, value}) => label + ': ' + value).join('  |  ');
  const metaHeight = wrap(encode(metaText), contentWidth, regular, 9).length * 13 +
    wrap(encode(businessText), contentWidth, regular, 10).length * 14.3 + 12;
  cursor -= 7;
  page.drawRectangle({x:margin-6, y:cursor-metaHeight+10, width:contentWidth+12, height:metaHeight+4, color:pale});
  drawBlock(metaText, regular, 9);
  drawBlock(businessText, regular, 10);
  cursor -= 8;
  if (concerns.length > 2) {
    drawBlock('Other findings to review', bold, 11, true);
    concerns.slice(2).forEach(concern => drawBlock(concern, regular, 9.5));
  }
  openChapter('Source responses');
  drawBlock('Evidence & Methodology  /  ' + content.coverage, regular, 11);
  let previousArea = '';
  for (const {area, prompt, answer, uncertain} of content.evidence) {
    const promptWidth = contentWidth * 0.45;
    const answerX = margin + promptWidth + 16;
    const promptLines = wrap(encode(prompt), promptWidth, bold, 10);
    const answerLines = wrap(encode(answer), pageWidth - margin - answerX, regular, 10);
    const rowHeight = Math.max(promptLines.length, answerLines.length) * 12 + 5;
    const before = page;
    ensureSpace(rowHeight + (area === previousArea ? 0 : 13));
    if (previousArea !== area || page !== before) {
      page.drawLine({start:{x:margin,y:cursor+5},end:{x:pageWidth-margin,y:cursor+5},thickness:.65,color:silver});
      page.drawText(area.toUpperCase(),{x:margin,y:cursor-3,font:bold,size:8,color:muted});
      cursor -= 13;
    }
    previousArea = area;
    if (uncertain) {
      page.drawRectangle({x:answerX-5,y:cursor-rowHeight+9,width:pageWidth-margin-answerX+10,height:rowHeight-2,color:pale});
      page.drawRectangle({x:answerX-6,y:cursor-rowHeight+9,width:1.5,height:rowHeight-2,color:muted});
    }
    promptLines.forEach((line, i) => page.drawText(line,{x:margin,y:cursor-12*i,font:bold,size:10,color:navy}));
    answerLines.forEach((line, i) => page.drawText(line,{x:answerX,y:cursor-12*i,font:regular,size:10,color:charcoal}));
    cursor -= rowHeight;
  }
  if (content.followUpEvidence.length) {
    sectionHeading('Follow-up responses');
    for (const {prompt, answer} of content.followUpEvidence) {
      ensureSpace(53);
      drawBlock(prompt, bold, 10);
      drawBlock(answer, regular, 10);
    }
  }
  const pages = pdf.getPages();
  pages.forEach((item, index) => {
    item.drawLine({start: {x: margin, y: 39}, end: {x: pageWidth - margin, y: 39}, thickness: 0.8, color: lineColor});
    item.drawText('Silverspark Consulting   |   sspark.net', {x: margin, y: 24, size: 8.5, font: regular, color: muted});
    const counter = `${index + 1} / ${pages.length}`;
    item.drawText(counter, {x: pageWidth - margin - regular.widthOfTextAtSize(counter, 8.5), y: 24, size: 8.5, font: regular, color: muted});
  });

  const bytes = new Uint8Array(await pdf.save());
  return new File([bytes], `Silverspark_Compass_AI_Readiness_Report_${content.date}.pdf`, {type: 'application/pdf'});
}

export async function downloadReport(content: ReportContent) {
  const file = await createReportFile(content);
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  document.body.append(link);
  try {
    link.click();
    return url;
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  } finally {
    link.remove();
  }
}
