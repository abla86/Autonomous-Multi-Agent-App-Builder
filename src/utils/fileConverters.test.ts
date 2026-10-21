import { describe, it, expect, afterEach, vi } from 'vitest';
import JSZip from 'jszip';
import {
  parseUniversalFile,
  exportProjectZip,
  exportProjectWordDoc,
} from './fileConverters';
import type { Project } from '../types';

/**
 * Integration tests for src/utils/fileConverters.ts.
 *
 * These exercise the real JSZip pipeline end to end: archives are built with
 * JSZip, handed to `parseUniversalFile` as real `File` objects, and the export
 * helpers are round-tripped back through JSZip to prove the bytes written are
 * the bytes read. Nothing is mocked except the browser download plumbing
 * (`URL.createObjectURL` / anchor click), which is not part of JSZip processing.
 */

const ORIGINAL_CREATE_OBJECT_URL = URL.createObjectURL;
const ORIGINAL_REVOKE_OBJECT_URL = URL.revokeObjectURL;

/** Build an in-memory archive and wrap it as a browser File. */
async function makeArchiveFile(
  fileName: string,
  entries: Record<string, string>,
  mime = 'application/octet-stream'
): Promise<File> {
  const zip = new JSZip();
  for (const [entryPath, content] of Object.entries(entries)) {
    zip.file(entryPath, content);
  }
  const blob = await zip.generateAsync({ type: 'blob' });
  return new File([blob], fileName, { type: mime });
}

/** Intercept the download plumbing and capture the produced Blob. */
function captureDownload(): { get: () => Blob | null } {
  let captured: Blob | null = null;
  (URL as any).createObjectURL = (blob: Blob) => {
    captured = blob;
    return 'blob:captured';
  };
  (URL as any).revokeObjectURL = () => {};
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  return { get: () => captured };
}

afterEach(() => {
  vi.restoreAllMocks();
  (URL as any).createObjectURL = ORIGINAL_CREATE_OBJECT_URL;
  (URL as any).revokeObjectURL = ORIGINAL_REVOKE_OBJECT_URL;
});

const PROJECT: Project = {
  id: 'proj-test-1',
  name: 'SwarmForge Demo',
  description: 'Integration fixture for archive export/import.',
  version: '1.0.0',
  status: 'tested',
  healthScore: 96,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  stats: {
    linesOfCode: 42,
    filesCount: 2,
    testsPassed: 12,
    securityGrade: 'A',
  },
  files: [
    {
      id: 'file-1',
      name: 'main.ts',
      path: '/src/main.ts',
      content: 'export const boot = () => "swarm";\n',
      language: 'typescript',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'file-2',
      name: 'notes.md',
      path: '/docs/notes.md',
      content: '# Notes\n\nAtomic persistence.\n',
      language: 'markdown',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ],
};

describe('parseUniversalFile — JSZip archive reading', () => {
  it('extracts paragraphs from a .docx package via word/document.xml', async () => {
    const file = await makeArchiveFile('spec.docx', {
      '[Content_Types].xml':
        '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/></Types>',
      'word/document.xml':
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' +
        '<w:p><w:r><w:t>SwarmForge Architecture</w:t></w:r></w:p>' +
        '<w:p><w:r><w:t>Atomic persistence guarantee</w:t></w:r></w:p>' +
        '</w:body></w:document>',
    });

    const results = await parseUniversalFile(file);

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('spec.md');
    expect(results[0].path).toBe('/docs/spec.md');
    expect(results[0].language).toBe('markdown');
    expect(results[0].originalType).toBe('Word Document (.docx)');
    expect(results[0].content).toContain('SwarmForge Architecture');
    expect(results[0].content).toContain('Atomic persistence guarantee');
    expect(results[0].summary).toMatch(/2 paragraphs/);
    expect(results[0].sizeBytes).toBeGreaterThan(0);
  });

  it('falls back to a raw text decode when the DOCX package has no word/document.xml', async () => {
    const file = await makeArchiveFile('legacy.doc', {
      'unrelated.bin': 'plain fallback content that survives decoding',
    });

    const results = await parseUniversalFile(file);

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('legacy.txt');
    expect(results[0].originalType).toBe('Word Document (.doc)');
    expect(results[0].content).toContain('plain fallback content');
  });

  it('reads every slide from a .pptx package in numeric order', async () => {
    const slide = (text: string) =>
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" ' +
      'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">' +
      '<p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>' +
      text +
      '</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>';

    const file = await makeArchiveFile('deck.pptx', {
      // deliberately out of order to prove numeric sorting
      'ppt/slides/slide2.xml': slide('Security Posture'),
      'ppt/slides/slide1.xml': slide('Executive Overview'),
    });

    const results = await parseUniversalFile(file);

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('deck-presentation.md');
    expect(results[0].originalType).toBe('PowerPoint Presentation (.pptx)');
    expect(results[0].summary).toMatch(/2 slides/);
    expect(results[0].content).toContain('### Slide 1');
    expect(results[0].content).toContain('Executive Overview');
    expect(results[0].content).toContain('### Slide 2');
    expect(results[0].content).toContain('Security Posture');
    // slide 1 content must precede slide 2 content
    expect(results[0].content.indexOf('Executive Overview')).toBeLessThan(
      results[0].content.indexOf('Security Posture')
    );
  });

  it('resolves shared strings into CSV rows for a .xlsx workbook', async () => {
    const file = await makeArchiveFile('report.xlsx', {
      'xl/sharedStrings.xml':
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
        '<si><t>Agent</t></si><si><t>Score</t></si><si><t>Analyst</t></si></sst>',
      'xl/worksheets/sheet1.xml':
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>' +
        '<row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c></row>' +
        '<row r="2"><c r="A2" t="s"><v>2</v></c><c r="B2"><v>98</v></c></row>' +
        '</sheetData></worksheet>',
    });

    const results = await parseUniversalFile(file);

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('report.csv');
    expect(results[0].originalType).toBe('Excel Spreadsheet (.xlsx)');
    expect(results[0].content).toContain('Agent, Score');
    expect(results[0].content).toContain('Analyst, 98');
    expect(results[0].summary).toMatch(/2 spreadsheet rows/);
  });

  it('unpacks only text/code entries from a .zip and skips binaries and OS junk', async () => {
    const file = await makeArchiveFile('repo.zip', {
      'src/index.ts': 'export const x = 1;\n',
      'README.md': '# Readme\n',
      'docs/guide.md': '# Guide\n',
      'assets/logo.png': '\u0089PNG\r\n\u001a\n binary-ish bytes',
      '__MACOSX/._index.ts': 'resource fork junk',
      '.DS_Store': 'finder metadata',
    });

    const results = await parseUniversalFile(file);
    const byName = Object.fromEntries(results.map((r) => [r.name, r]));

    expect(results).toHaveLength(3);
    expect(Object.keys(byName).sort()).toEqual(['README.md', 'guide.md', 'index.ts']);
    expect(byName['index.ts'].language).toBe('typescript');
    expect(byName['index.ts'].path).toBe('/src/index.ts');
    expect(byName['guide.md'].language).toBe('markdown');
    expect(byName['guide.md'].path).toBe('/docs/guide.md');
    // non-text and OS metadata entries must be excluded
    expect(results.some((r) => r.name.endsWith('.png'))).toBe(false);
    expect(results.some((r) => r.path.includes('__MACOSX'))).toBe(false);
  });
});

describe('export helpers — JSZip archive writing', () => {
  it('writes a full project ZIP that JSZip can read back intact', async () => {
    const download = captureDownload();

    await exportProjectZip(PROJECT);

    const blob = download.get();
    expect(blob).toBeInstanceOf(Blob);

    const reopened = await JSZip.loadAsync(await blob!.arrayBuffer());

    expect(reopened.file('README.md')).toBeTruthy();
    expect(reopened.file('project-manifest.json')).toBeTruthy();
    // leading slashes are stripped so files land at the archive root
    expect(reopened.file('src/main.ts')).toBeTruthy();
    expect(reopened.file('docs/notes.md')).toBeTruthy();

    const readme = await reopened.file('README.md')!.async('text');
    expect(readme).toContain(PROJECT.name);
    expect(readme).toContain('Health Score: 96%');

    const manifest = JSON.parse(await reopened.file('project-manifest.json')!.async('text'));
    expect(manifest.id).toBe(PROJECT.id);
    expect(manifest.name).toBe(PROJECT.name);
    expect(manifest.filesCount).toBe(PROJECT.files.length);

    const source = await reopened.file('src/main.ts')!.async('text');
    expect(source).toBe(PROJECT.files[0].content);
  });

  it('round-trips an exported Word document back through the importer', async () => {
    const download = captureDownload();

    await exportProjectWordDoc(PROJECT);

    const blob = download.get();
    expect(blob).toBeInstanceOf(Blob);

    // the generated .docx must be a valid OOXML package
    const reopened = await JSZip.loadAsync(await blob!.arrayBuffer());
    expect(reopened.file('[Content_Types].xml')).toBeTruthy();
    expect(reopened.file('_rels/.rels')).toBeTruthy();
    expect(reopened.file('word/document.xml')).toBeTruthy();

    const docxFile = new File([blob!], 'swarm-spec.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    const parsed = await parseUniversalFile(docxFile);

    expect(parsed).toHaveLength(1);
    expect(parsed[0].originalType).toBe('Word Document (.docx)');
    expect(parsed[0].name).toBe('swarm-spec.md');
    expect(parsed[0].content).toContain(PROJECT.name);
    expect(parsed[0].content).toContain(PROJECT.description);
  });
});
