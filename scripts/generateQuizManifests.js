import fs from 'fs/promises';
import path from 'path';

const ROOT = path.join(process.cwd(), 'public', 'Questions');
const EXTS = ['pdf','png','jpg','jpeg','gif','webp'];

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results = [];
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      results.push(...await walk(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

function extOf(filename) {
  const m = filename.match(/\.([^.]+)$/);
  return m ? m[1].toLowerCase() : '';
}

function basename(filename) {
  return path.basename(filename);
}

async function generate() {
  try {
    const allFiles = await walk(ROOT);
    const byFolder = new Map();

    for (const file of allFiles) {
      const rel = path.relative(ROOT, file);
      const folder = path.dirname(path.join(ROOT, rel));
      const b = basename(file);
      if (!byFolder.has(folder)) byFolder.set(folder, []);
      byFolder.get(folder).push({ file, name: b });
    }

    const quizzes = [];

    for (const [folder, files] of byFolder.entries()) {
      // Detect Q{n} and MS{n}
      const questionsMap = new Map();
      for (const f of files) {
        const qMatch = f.name.match(/^Q(\d+)\.(.+)$/i);
        const msMatch = f.name.match(/^MS(\d+)\.(.+)$/i);
        if (qMatch) {
          const idx = Number(qMatch[1]);
          const ext = extOf(f.name);
          const urlPath = path.join('/Questions', path.relative(ROOT, folder), f.name).replace(/\\/g, '/');
          if (!questionsMap.has(idx)) questionsMap.set(idx, {});
          questionsMap.get(idx).questionContent = urlPath;
          questionsMap.get(idx).questionContentType = ext === 'pdf' ? 'pdf' : 'image';
        } else if (msMatch) {
          const idx = Number(msMatch[1]);
          const ext = extOf(f.name);
          const urlPath = path.join('/Questions', path.relative(ROOT, folder), f.name).replace(/\\/g, '/');
          if (!questionsMap.has(idx)) questionsMap.set(idx, {});
          questionsMap.get(idx).markScheme = urlPath;
          questionsMap.get(idx).markSchemeType = ext === 'pdf' ? 'pdf' : 'image';
        }
      }

      if (questionsMap.size === 0) continue; // skip folders without Q files

      const sorted = Array.from(questionsMap.entries()).sort((a,b) => a[0]-b[0]);
      const questions = sorted.map(([idx, obj]) => ({
        id: `q${idx}`,
        title: `Question ${idx}`,
        ...obj
      }));

      const manifest = {
        id: path.basename(folder),
        title: path.basename(folder).replace(/[-_]/g, ' '),
        questions,
        lastScanned: new Date().toISOString(),
        autoExpand: true
      };

      const manifestPath = path.join(folder, 'manifest.json');
      await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
      console.log('Wrote', manifestPath);

      quizzes.push({ id: manifest.id, title: manifest.title, folder: path.join('/Questions', path.relative(ROOT, folder)).replace(/\\/g, '/'), questionCount: questions.length, manifest: path.join('/Questions', path.relative(ROOT, folder), 'manifest.json').replace(/\\/g, '/') });
    }

    // Write central index
    const index = { generatedAt: new Date().toISOString(), quizzes };
    const indexPath = path.join(ROOT, 'index.json');
    await fs.writeFile(indexPath, JSON.stringify(index, null, 2), 'utf8');
    console.log('Wrote central index at', indexPath);

  } catch (err) {
    console.error('Failed to generate manifests', err);
    process.exit(1);
  }
}

generate();
