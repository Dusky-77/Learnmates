import slugify from './slugify';

export type PdfViewerBasePath = {
  type: string;
  board: string;
  subject: string;
  topicSlug: string;
};

/** Slug for the PDF filename segment of the viewer URL (e.g. alkenes-ial-chem-haf.pdf). */
export function getPdfFileSlug(pdfUrl: string): string {
  const rawName = decodeURIComponent(pdfUrl.split('/').pop() || 'file.pdf');
  if (!rawName.toLowerCase().endsWith('.pdf')) {
    return `${slugify(rawName)}.pdf`;
  }
  const baseName = rawName.slice(0, -4);
  return `${slugify(baseName)}.pdf`;
}

export function buildPdfViewerPath(
  base: PdfViewerBasePath,
  pdfUrl: string
): string {
  const type = base.type.toLowerCase();
  const board = base.board.toLowerCase();
  const subject = encodeURIComponent(base.subject);
  const topicSlug = encodeURIComponent(base.topicSlug);
  const pdfFile = encodeURIComponent(getPdfFileSlug(pdfUrl));
  return `/curriculum/${type}/${board}/${subject}/${topicSlug}/${pdfFile}`;
}

export function buildTopicPath(base: PdfViewerBasePath): string {
  const type = base.type.toLowerCase();
  const board = base.board.toLowerCase();
  const subject = encodeURIComponent(base.subject);
  const topicSlug = encodeURIComponent(base.topicSlug);
  return `/curriculum/${type}/${board}/${subject}/${topicSlug}`;
}
