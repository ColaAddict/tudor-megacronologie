const fs = require('fs');

const filePath = './events.js';

if (!fs.existsSync(filePath)) {
  console.error('Eroare: fișierul events.js nu există în directorul curent!');
  process.exit(1);
}

const fileContent = fs.readFileSync(filePath, 'utf8');

// Load events
let events;
try {
  const sandbox = {};
  new Function('window', fileContent)(sandbox);
  events = sandbox.events;
} catch (err) {
  console.error('Eroare la parsarea events.js:', err);
  process.exit(1);
}

console.log(`S-au încărcat ${events.length} evenimente din events.js`);

// Roman numerals to integer helper
function romanToInt(roman) {
  const map = {I:1,V:5,X:10,L:50,C:100,D:500,M:1000};
  let total = 0;
  const r = roman.toUpperCase();
  for (let i = 0; i < r.length; i++) {
    const current = map[r[i]];
    const next = map[r[i+1]];
    if (next && current < next) {
      total += next - current;
      i++;
    } else {
      total += current;
    }
  }
  return total;
}

// Clean and normalize dates
events.forEach(e => {
  if (!e) return;
  e.title = (e.title || '').trim();
  let dateStr = (e.date || '').trim();
  e.info = (e.info || '').trim();

  // If user typed BC indicators (î.Hr. / î.e.n. / BC), normalize to negative year
  if (/(î\.Hr\.|î\.e\.n\.|bc)/i.test(dateStr)) {
    const numMatch = dateStr.match(/(-?\d+)/);
    if (numMatch) {
      dateStr = '-' + Math.abs(parseInt(numMatch[1], 10));
    }
  }
  e.date = dateStr;

  // Re-evaluate boolean flags
  e.isCentury = /^[IVXLCDM]+$/i.test(e.date);
  e.isRange = /^\d{1,4}-\d{3,4}$/.test(e.date);

  // Normalize categories list
  if (!Array.isArray(e.categories)) {
    if (e.categories) e.categories = [e.categories];
    else if (e.category) e.categories = [e.category];
    else e.categories = ["general"];
  }
  e.categories = e.categories.map(c => c.trim().toLowerCase());
  
  // Remove unused properties if any
  delete e.sortKey;
  delete e.category;
});

// Sort scoring helper
function getSortYear(dateStr) {
  if (!dateStr) return 0;
  
  // 1. Roman Century (e.g. "II", "XVII")
  if (/^[IVXLCDM]+$/i.test(dateStr)) {
    const century = romanToInt(dateStr.toUpperCase());
    return (century - 1) * 100 + 0.999; // start of century
  }

  // 2. Year Range (e.g. "1290-1301")
  if (/^(-?\d{1,4})-(\d{3,4})$/.test(dateStr)) {
    const match = dateStr.match(/^(-?\d{1,4})-(\d{3,4})$/);
    const start = parseInt(match[1], 10);
    const end = parseInt(match[2], 10);
    return (start + end) / 2; // midpoint
  }

  // 3. Year + Month (e.g. "1693-12")
  if (/^(-?\d{1,4})-(\d{2})$/.test(dateStr)) {
    const match = dateStr.match(/^(-?\d{1,4})-(\d{2})$/);
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const sign = year < 0 ? -1 : 1;
    return sign * (Math.abs(year) + (month - 0.5) / 12);
  }

  // 4. Full ISO Date (e.g. "1330-11-09")
  if (/^(-?\d{1,4})-(\d{2})-(\d{2})$/.test(dateStr)) {
    const match = dateStr.match(/^(-?\d{1,4})-(\d{2})-(\d{2})$/);
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);
    const sign = year < 0 ? -1 : 1;
    return sign * (Math.abs(year) + (month - 1) / 12 + (day - 1) / 365.25);
  }

  // 5. Numeric Year (e.g. "271", "-82")
  if (/^(-?\d{1,4})$/.test(dateStr)) {
    return parseInt(dateStr, 10);
  }

  return 9999; // fallback
}

// Sort chronologically (earliest to latest)
events.sort((a, b) => getSortYear(a.date) - getSortYear(b.date));

// Save output back to events.js
const outputContent = `// Pre-sorted chronology database for historical learning tool
// Pre-sorted offline from earliest to latest. Do not edit directly unless preserving chronological order.
// To re-sort after adding items, run: node sort_events.js
window.events = ${JSON.stringify(events, null, 2)};
`;

fs.writeFileSync(filePath, outputContent, 'utf8');
console.log(`Succes! S-au sortat și salvat ${events.length} evenimente în ${filePath}`);
