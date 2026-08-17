import { PDFDocument, StandardFonts } from 'pdf-lib';

async function testArrow() {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  
  try {
    const text = `New \u2192 Old`;
    font.widthOfTextAtSize(text, 10);
    console.log("SUCCESS!");
  } catch (e) {
    console.error("FAILED!", e.message);
  }
}

testArrow();
