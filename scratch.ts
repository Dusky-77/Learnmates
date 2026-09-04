import { generateMergedPDF } from './src/utils/pdfMerger.ts';

async function test() {
  console.log('Testing...');
  const items = [
    { id: 'q1', url: '/topicals/igcse/cambridge/Physics/Physics/Jun 2017 P31 MS1.pdf', type: 'pdf' },
    { id: 'q2', url: '/topicals/igcse/cambridge/Physics/Physics/Jun 2017 P31 MS2.pdf', type: 'pdf' }
  ];
  try {
    const blob = await generateMergedPDF(items, 'Mark Scheme');
    console.log('Blob size:', blob.size);
  } catch(e) {
    console.error('Error:', e);
  }
}

test();
