import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const DESIGN_DIR =
  "C:/Users/Oxygen/AppData/Local/Temp/opencode/bazaarflow_design/stitch_bazaarflow_e_commerce_platform";
const FILES = [
  "bazaarflow_homepage/code.html",
  "bazaarflow_product_discovery_explore/code.html",
  "bazaarflow_smart_bundle_builder/code.html",
];

const outDir = join(process.cwd(), "public", "images", "products");
mkdirSync(outDir, { recursive: true });

const catDir = join(process.cwd(), "public", "images", "categories");
mkdirSync(catDir, { recursive: true });

const imgRe = /<img[^>]*?src="(https:\/\/lh3\.googleusercontent\.com\/aida[^"]+)"[^>]*?>/g;
const altRe = /data-alt="([^"]*)"/;

const seen = new Map();

for (const f of FILES) {
  const html = readFileSync(join(DESIGN_DIR, f), "utf8");
  let m;
  while ((m = imgRe.exec(html))) {
    const url = m[1];
    if (seen.has(url)) continue;
    const tag = m[0];
    const altMatch = tag.match(altRe);
    const alt = altMatch ? altMatch[1] : "";
    seen.set(url, alt);
  }
}

const entries = [...seen.entries()];
console.log(`Found ${entries.length} unique images`);

const manifest = [];

async function download(url, dest) {
  const big = url.includes("=") ? url : url + "=w1400";
  const res = await fetch(big, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buf);
  return buf.length;
}

let i = 0;
for (const [url, alt] of entries) {
  i += 1;
  const name = `img-${String(i).padStart(2, "0")}.jpg`;
  const dest = join(outDir, name);
  try {
    if (!existsSync(dest)) {
      const size = await download(url, dest);
      console.log(`  ${name}  ${(size / 1024).toFixed(0)}kb  ${alt.slice(0, 60)}`);
    }
    manifest.push({ file: `/images/products/${name}`, alt, source: url });
  } catch (e) {
    console.log(`  FAILED ${name}: ${e.message}`);
  }
}

writeFileSync(
  join(process.cwd(), "scripts", "image-manifest.json"),
  JSON.stringify(manifest, null, 2),
);
console.log(`Done. ${manifest.length} images.`);
