#!/usr/bin/env node
/**
 * Fetches the current Avorion wiki goods + station economy and regenerates
 * goods.js.
 *
 * The wiki was reworked after Avorion 2.0: the Goods page no longer carries
 * "Sold By" / "Bought By" columns. Instead every station page declares what it
 * produces (Production) and what it consumes (Production Materials), mines add
 * a "Goods Used" list, and consumer stations list what they purchase under a
 * "Goods" heading. This script inverts all of that back into per-good Sold By /
 * Bought By lists.
 *
 * Usage: node fetchGoods.js
 */

const fs = require('fs');
const path = require('path');

const API = 'https://avorion.fandom.com/api.php';
const ROOT = __dirname;
const CACHE_DIR = path.join(ROOT, '.wiki_cache');
const OUT_FILE = path.join(ROOT, 'goods.js');
const USER_AGENT =
  'avorion-goods-filter/1.0 (https://github.com/selfup/avorion)';

const PURCHASE_INTRO =
  /purchas|will buy|buys the following|buy the following|goods are used|uses the following|can be sold to|consumes/i;

// Station-name words that must never be treated as goods.
const STATION_WORDS =
  /(factory|mine|farm|dock|manufacturer|ranch|refinery|collector|extractor|trader|outpost|hub\b|depot|scrapyard|shipyard|academy)$/i;

// ---------------------------------------------------------------------------
// wiki API
// ---------------------------------------------------------------------------

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const api = async params => {
  const url = `${API}?${new URLSearchParams({
    format: 'json',
    formatversion: '2',
    ...params,
  })}`;
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
};

const slug = title => title.replace(/[^a-zA-Z0-9]+/g, '_');

const wikitext = async (title, { refresh = false } = {}) => {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const file = path.join(CACHE_DIR, `${slug(title)}.json`);
  if (!refresh && fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }
  const data = await api({
    action: 'parse',
    page: title,
    prop: 'wikitext',
    redirects: '1',
  });
  const parsed = data.parse
    ? { title, redirect: data.parse.redirects?.[0]?.to, wt: data.parse.wikitext }
    : { title, missing: true, wt: '' };
  fs.writeFileSync(file, JSON.stringify(parsed));
  await sleep(120);
  return parsed;
};

const categoryMembers = async category => {
  const members = [];
  let cont = '';
  do {
    const data = await api({
      action: 'query',
      list: 'categorymembers',
      cmtitle: category,
      cmlimit: '500',
      cmcontinue: cont,
    });
    members.push(...data.query.categorymembers.map(m => m.title));
    cont = data.continue ? data.continue.cmcontinue : '';
  } while (cont);
  return members;
};

// ---------------------------------------------------------------------------
// wikitext parsing
// ---------------------------------------------------------------------------

const stripLinks = text =>
  text
    .replace(/\[\[File:[^\]]*\]\]/gi, '')
    .replace(/\[\[([^[\]|]+)\|([^[\]]+)\]\]/g, '$2')
    .replace(/\[\[([^[\]]+)\]\]/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/'''?/g, '')
    .trim();

const labelOf = text => {
  const match = text.match(/\[\[([^[\]]+)\]\]/);
  if (!match) return stripLinks(text);
  const parts = match[1].split('|');
  return (parts.length > 1 ? parts[1] : parts[0]).trim();
};

const splitAttributed = line => {
  let cell = line.replace(/^[!|]\s*/, '');
  const bar = cell.indexOf('|');
  if (bar !== -1 && /^\s*(style|align|colspan|rowspan|scope|class|width)\s*=/i.test(cell)) {
    cell = cell.slice(bar + 1);
  }
  return stripLinks(cell);
};

const parseTables = body => {
  const tables = [];
  const tableRe = /\{\|([\s\S]*?)\|\}/g;
  let match;
  while ((match = tableRe.exec(body))) {
    const headers = [];
    const rawRows = [];
    let row = null;
    for (const raw of match[1].split('\n')) {
      const line = raw.trim();
      if (!line || line.startsWith('{|') || line.startsWith('|+')) continue;
      if (line.startsWith('!')) {
        line
          .replace(/^!\s*/, '')
          .split('!!')
          .forEach(h => headers.push(splitAttributed(`!${h}`)));
      } else if (line === '|-') {
        if (row) rawRows.push(row);
        row = [];
      } else if (line.startsWith('|')) {
        if (!row) row = [];
        line.split('||').forEach(c => row.push(splitAttributed(c)));
      }
    }
    if (row) rawRows.push(row);

    const rows = rawRows
      .filter(cells => cells.some(c => c !== ''))
      .map(cells => Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? ''])));
    if (headers.length) tables.push({ headers, rows });
  }
  return tables;
};

const splitSections = wt => {
  const sections = [];
  let current = { level: 0, title: '', body: [] };
  for (const line of wt.split('\n')) {
    const header = line.match(/^(=+)\s*(.+?)\s*\1\s*$/);
    if (header) {
      sections.push(current);
      current = { level: header[1].length, title: stripLinks(header[2]), body: [] };
    } else {
      current.body.push(line);
    }
  }
  sections.push(current);
  return sections.map(s => ({ ...s, body: s.body.join('\n') }));
};

// A section's own body plus any nested subsections of it.
const sectionWithChildren = (sections, index) => {
  const base = sections[index];
  let body = base.body;
  for (let i = index + 1; i < sections.length; i++) {
    if (sections[i].level <= base.level) break;
    body += '\n' + sections[i].body;
  }
  return body;
};

const parseBulletGoods = body => {
  const names = [];
  for (const line of body.split('\n')) {
    const bullet = line.match(/^[:*]+\s*(.+)$/);
    if (!bullet) continue;
    const text = bullet[1].trim();
    if (!text) continue;
    // A single bullet may hold a comma-separated run of goods.
    for (const part of text.split(/,(?![^[]*\])/)) {
      const piece = part.trim().replace(/^\*+\s*/, '');
      if (piece) names.push(labelOf(piece));
    }
  }
  return names.filter(Boolean);
};

const hasHeader = (table, name) =>
  table.headers.some(h => h.toLowerCase() === name.toLowerCase());

// Column that names who supplies a consumed good. Stations label it variously.
const SUPPLIER_HEADER = /^(sold by|production factory|consumed by)$/i;
const hasSupplierColumn = table =>
  table.headers.some(h => SUPPLIER_HEADER.test(h.trim()));

// ---------------------------------------------------------------------------
// domain parsing
// ---------------------------------------------------------------------------

const parseGoodsPage = wt => {
  const sections = splitSections(wt);
  const [table] = parseTables(sections.map(s => s.body).join('\n')).filter(
    t =>
      (hasHeader(t, 'Name') || hasHeader(t, 'Good')) &&
      hasHeader(t, 'Volume') &&
      hasHeader(t, 'Level'),
  );
  if (!table) throw new Error('Could not find the goods table on the Goods page');
  return table.rows.map(row => ({
    Name: row['Good'] || row['Name'],
    Volume: row['Volume'],
    'Avg. Price': row['Price'],
    'Illegal?': /^yes$/i.test(row['Illegal']) ? 'yes' : 'no',
    'Dangerous?': /^yes$/i.test(row['Dangerous']) ? 'yes' : 'no',
  }));
};

const isNoteLine = name =>
  !name ||
  STATION_WORDS.test(name) ||
  /^(note|source|see also|list of|this station|these|the following|no )/i.test(name) ||
  /[:：]$/.test(name);

// Returns { produces: Set, consumes: Set } for a station page.
const parseStationPage = wt => {
  const sections = splitSections(wt);
  const produces = new Set();
  const consumes = new Set();

  // Nearest ancestor-or-self heading that names an economy topic: this is what
  // a table nested under "==== Type 1 ====" belongs to.
  const topicOf = index => {
    let childLevel = sections[index].level;
    for (let i = index; i >= 0; i--) {
      if (i < index && sections[i].level >= childLevel) continue;
      childLevel = sections[i].level;
      const title = sections[i].title;
      if (/^Production$/i.test(title)) return 'produces';
      if (/^Production Materials$/i.test(title)) return 'consumes';
      if (/^(Goods Used|Used Goods|Goods|Trading)$/i.test(title))
        return 'bullets-consumes';
      if (sections[i].level === 0) break;
    }
    return null;
  };

  sections.forEach((section, index) => {
    const topic = topicOf(index);
    if (!topic) return;
    const body = section.body;

    if (topic === 'bullets-consumes') {
      if (PURCHASE_INTRO.test(sectionWithChildren(sections, index))) {
        for (const name of parseBulletGoods(body)) {
          if (!isNoteLine(name)) consumes.add(name);
        }
      }
      return;
    }

    for (const table of parseTables(body)) {
      if (!hasHeader(table, 'Name')) continue;
      // A supplier column confirms a materials table; a "Consuming Factory"
      // column confirms production.
      const hasConsuming = table.headers.some(h => /consuming factory/i.test(h));
      const isMaterial =
        hasSupplierColumn(table) || (topic === 'consumes' && !hasConsuming);
      for (const row of table.rows) {
        const name = row['Name'];
        if (isNoteLine(name)) continue;
        (isMaterial ? consumes : produces).add(name);
      }
    }
  });

  return { produces, consumes };
};

// ---------------------------------------------------------------------------
// name resolution
// ---------------------------------------------------------------------------

// Words that differ between the Goods page and station pages.
const ALIASES = {
  'anti-grav generator': 'Antigrav Generator',
  'anti-grav generators': 'Antigrav Generator',
  'aluminium': 'Aluminum',
  'fungi': 'Fungus',
};

const canonicalName = raw =>
  (raw || '')
    .replace(/\s*!+\s*$/, '')
    .replace(/^illegal\s+/i, '')
    .trim();

const buildResolver = goods => {
  const index = new Map();
  goods.forEach(good => index.set(canonicalName(good.Name).toLowerCase(), good.Name));

  return raw => {
    const base = canonicalName(raw);
    if (!base) return null;
    const lower = base.toLowerCase();
    const singular = lower.replace(/es$/, '').replace(/s$/, '');
    const candidates = [
      lower,
      lower.replace(/es$/, ''),
      lower.replace(/s$/, ''),
      ALIASES[lower],
      ALIASES[singular],
    ].map(c => c && c.toLowerCase());
    for (const candidate of candidates) {
      if (candidate && index.has(candidate)) return index.get(candidate);
    }
    return null;
  };
};

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

const CONSUMER_STATIONS = [
  'Casino',
  'Habitat',
  'Biotope',
  'Equipment Dock',
  'Military Outpost',
  'Research Station',
  'Repair Dock',
  'Trading Post',
  'Planetary Trading Post',
  'Smuggler Hideout',
  'Travel Hub',
  'Shipyard',
  'Resource Depot',
  'Scrapyard',
  'Turret Factory',
  'Power Plant',
];

const stationTitles = async () => {
  const [stations, factories] = await Promise.all([
    categoryMembers('Category:Stations'),
    categoryMembers('Category:Factories'),
  ]);
  const ignored = new Set([
    'Factories',
    'Mine',
    'Mines',
    'Farm',
    'Station',
    'Station/ru',
    'Travel Hub',
    'Wreckage',
    'Crew',
  ]);
  return [...new Set([...stations, ...factories, ...CONSUMER_STATIONS])]
    .filter(title => !ignored.has(title))
    .sort();
};

const main = async () => {
  console.log('Fetching Goods page...');
  const goodsPage = await wikitext('Goods');
  const goods = parseGoodsPage(goodsPage.wt);
  console.log(`  parsed ${goods.length} goods`);

  const titles = await stationTitles();
  console.log(`Fetching ${titles.length} station pages...`);

  const resolve = buildResolver(goods);
  const soldBy = new Map(goods.map(g => [g.Name, new Set()]));
  const boughtBy = new Map(goods.map(g => [g.Name, new Set()]));
  const unknown = new Set();

  const record = (map, name, station) => {
    const canonical = resolve(name);
    if (canonical) map.get(canonical).add(station);
    else unknown.add(name);
  };

  for (const title of titles) {
    const page = await wikitext(title);
    if (!page.wt || page.missing) continue;
    if (/^#redirect/i.test(page.wt.trim())) continue;
    const station = page.redirect || title;
    const { produces, consumes } = parseStationPage(page.wt);
    produces.forEach(name => record(soldBy, name, station));
    consumes.forEach(name => record(boughtBy, name, station));
  }

  const sortedJoin = set => [...set].sort((a, b) => a.localeCompare(b)).join(', ');

  const result = goods.map(good => ({
    Name: good.Name,
    Volume: good.Volume,
    'Avg. Price': good['Avg. Price'],
    'Sold By': sortedJoin(soldBy.get(good.Name) || new Set()),
    'Bought By': sortedJoin(boughtBy.get(good.Name) || new Set()),
    'Illegal?': good['Illegal?'],
    'Dangerous?': good['Dangerous?'],
  }));

  fs.writeFileSync(OUT_FILE, `export default ${JSON.stringify(result)}`, 'utf8');

  console.log(`Wrote ${result.length} goods to ${path.relative(ROOT, OUT_FILE)}`);
  const empty = result.filter(g => !g['Sold By'] && !g['Bought By']);
  console.log(`  goods with no station links: ${empty.length}`);
  if (empty.length) console.log('   ', empty.map(g => g.Name).join(', '));
  const unresolved = [...unknown].filter(name => name && !/no regular|none|n\/a/i.test(name));
  console.log(`  names not matched to a goods-page entry: ${unresolved.length}`);
  if (unresolved.length)
    console.log('   ', [...unresolved].sort().join(' | '));
};

module.exports = {
  parseGoodsPage,
  parseStationPage,
};

if (require.main === module) {
  main().catch(error => {
    console.error(error);
    process.exit(1);
  });
}
