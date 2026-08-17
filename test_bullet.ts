import { PDFDocument, StandardFonts } from 'pdf-lib';

async function testBullet() {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  
  try {
    const text = `  \u2022 test`;
    font.widthOfTextAtSize(text, 10);
    console.log("SUCCESS!");
  } catch (e) {
    console.error("FAILED!", e.message);
  }
}

testBullet();
