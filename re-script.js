/* ==========================================================
   CONFIG
   Once you've published the Google Sheet to the web as CSV
   (File > Share > Publish to web > select the sheet > CSV),
   paste that link here. Until then, the page falls back to
   the sample data below so it still renders.
========================================================== */
const SHEET_CSV_URL = ""; // e.g. "https://docs.google.com/spreadsheets/d/e/XXXXX/pub?output=csv"

/* Fallback sample data, mirrors the columns in the Google Sheet */
const FALLBACK_DATA = [
  {
    Status: "Featured", Address: "Call Me", City: "Beverly Hills", State: "CA", Zip: "",
    PropertyType: "Call Me", Description: "Add the property description here.",
    MarketValue: "$6,330,800", ARV: "$7,850,000", BuyIn: "$5,800,000", InvestmentStrategy: "Call Me",
    CapRate: "Call Me", GRM: "Call Me", RehabBudget: "$420,000", EstRentCashFlow: "Call Me",
    Beds: "Call Me", Baths: "Call Me", SqFt: "Call Me", LotSize: "Call Me",
    Image1: "beverly-hills-featured.jpg", Image2: "", Image3: "",
    Notes: "Rehab budget requires cash.",
    StreetViewEmbed: ""
  },
  {
    Status: "Active", Address: "1965 Isabel St", City: "Los Angeles", State: "CA", Zip: "90065",
    PropertyType: "Multi-Family", Description: "Add the property description here.",
    MarketValue: "$841,200", ARV: "$1,250,000", BuyIn: "$700,000", InvestmentStrategy: "Call Me",
    CapRate: "Call Me", GRM: "Call Me", RehabBudget: "$85,000", EstRentCashFlow: "Call Me",
    Beds: "3", Baths: "2", SqFt: "Call Me", LotSize: "Call Me",
    Image1: "", Image2: "", Image3: "",
    Notes: "Two units on this property. Vacant lot next door, ~5,009 sq ft, zoned R2. Not currently for sale, but was previously listed at $549K for a 2-unit or duplex build.",
    StreetViewEmbed: '<iframe src="https://www.google.com/maps/embed?pb=!4v1787761396322!6m8!1m7!1srtH-A5aTu-HPJKJV3HaYCQ!2m2!1d34.1024871081798!2d-118.2341408407918!3f80.84515877138647!4f10.76709112978628!5f0.7820865974627469" width="600" height="450" style="border:0;" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>'
  },
  {
    Status: "Active", Address: "517 Orange Grove Pl", City: "Pasadena", State: "CA", Zip: "91103",
    PropertyType: "Townhome", Description: "3 bed / 3 bath townhome in a gated community, 1939 sqft, built 1993.",
    MarketValue: "$848,000", ARV: "$995,000", BuyIn: "$765,000", InvestmentStrategy: "Call Me",
    CapRate: "Call Me", GRM: "Call Me", RehabBudget: "$42,000", EstRentCashFlow: "Call Me",
    Beds: "3", Baths: "3", SqFt: "1,939", LotSize: "Call Me",
    Image1: "", Image2: "", Image3: "", Notes: "",
    StreetViewEmbed: '<iframe src="https://www.google.com/maps/embed?pb=!4v1787763313770!6m8!1m7!1sTHh0OVNyXjKrpXHJhXWyug!2m2!1d34.15311022431125!2d-118.1559412707011!3f51.61211!4f0!5f0.7820865974627469" width="800" height="600" style="border:0;" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>'
  },
  {
    Status: "Active", Address: "10467 Laramie Ave", City: "Chatsworth", State: "CA", Zip: "91311",
    PropertyType: "Single-Family", Description: "Add the property description here.",
    MarketValue: "$1,392,600", ARV: "$1,600,000", BuyIn: "$1,040,000", InvestmentStrategy: "Call Me",
    CapRate: "Call Me", GRM: "Call Me", RehabBudget: "$155,000", EstRentCashFlow: "Call Me",
    Beds: "Call Me", Baths: "Call Me", SqFt: "Call Me", LotSize: "Call Me",
    Image1: "", Image2: "", Image3: "", Notes: "",
    StreetViewEmbed: '<iframe src="https://www.google.com/maps/embed?pb=!4v1787759354987!6m8!1m7!1soq-0Q3kzyteCyeHC9JyUUA!2m2!1d34.26060960702243!2d-118.5727245281376!3f302.50537!4f0!5f0.7820865974627469" width="800" height="600" style="border:0;" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>'
  },
  {
    Status: "Active", Address: "TBD \u2014 Long Beach commercial address", City: "Long Beach", State: "CA", Zip: "",
    PropertyType: "Commercial", Description: "Add the property description here.",
    MarketValue: "TBD", ARV: "TBD", BuyIn: "TBD", InvestmentStrategy: "TBD",
    CapRate: "TBD", GRM: "TBD", RehabBudget: "TBD", EstRentCashFlow: "TBD",
    Beds: "", Baths: "", SqFt: "TBD", LotSize: "TBD",
    Image1: "", Image2: "", Image3: "", Notes: "", StreetViewEmbed: ""
  }
];

/* ==========================================================
   Tiny CSV parser (handles quoted fields with commas)
========================================================== */
function parseCSV(text){
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++){
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes){
      if (char === '"' && next === '"'){ field += '"'; i++; }
      else if (char === '"'){ inQuotes = false; }
      else { field += char; }
    } else {
      if (char === '"'){ inQuotes = true; }
      else if (char === ','){ row.push(field); field = ""; }
      else if (char === '\n'){ row.push(field); rows.push(row); row = []; field = ""; }
      else if (char === '\r'){ /* skip */ }
      else { field += char; }
    }
  }
  if (field.length || row.length){ row.push(field); rows.push(row); }

  const headers = rows.shift().map(h => h.trim());
  return rows
    .filter(r => r.some(cell => cell.trim() !== ""))
    .map(r => {
      const obj = {};
      headers.forEach((h, idx) => { obj[h] = (r[idx] || "").trim(); });
      return obj;
    });
}

/* ==========================================================
   Helpers
========================================================== */
function safe(val){
  return (val === undefined || val === null || val === "") ? "TBD" : val;
}

function locationLine(p){
  return [p.City, p.State].filter(Boolean).join(", ") + (p.Zip ? " " + p.Zip : "");
}

function extractEmbedSrc(embedCode){
  if (!embedCode) return "";
  const match = embedCode.match(/src="([^"]+)"/);
  return match ? match[1] : embedCode.trim();
}

function imageBlock(p, className){
  const img = p.Image1 && p.Image1.trim();
  if (img){
    return `<div class="${className}"><img src="${img}" alt="${p.Address}" loading="lazy"></div>`;
  }
  const streetView = p.StreetViewEmbed && p.StreetViewEmbed.trim();
  if (streetView){
    const src = extractEmbedSrc(streetView);
    return `<div class="${className}"><iframe src="${src}" loading="lazy" style="width:100%;height:100%;border:0;position:absolute;inset:0;" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe><span class="media-tag">Street View</span></div>`;
  }
  return `<div class="${className}"><span class="no-image-label">Photo coming soon</span></div>`;
}

/* ==========================================================
   Renderers
========================================================== */
function renderFeatured(p){
  const slot = document.getElementById("featured-card-slot");
  if (!p){
    slot.innerHTML = `<p class="empty-note">No featured property set. Mark one row "Featured" in the sheet.</p>`;
    return;
  }
  slot.innerHTML = `
    <div class="featured-card">
      ${imageBlock(p, "featured-media")}
      <div class="featured-body">
        <h3>${p.Address}</h3>
        <div class="featured-loc">${locationLine(p)} &middot; ${safe(p.PropertyType)}</div>
        <p class="featured-desc">${safe(p.Description)}</p>
        <div class="stat-grid">
          <div class="stat"><div class="stat-label">Market Value</div><div class="stat-value">${safe(p.MarketValue)}</div></div>
          <div class="stat"><div class="stat-label">ARV</div><div class="stat-value">${safe(p.ARV)}</div></div>
          <div class="stat"><div class="stat-label">Buy-In</div><div class="stat-value">${safe(p.BuyIn)}</div></div>
          <div class="stat"><div class="stat-label">Cap Rate</div><div class="stat-value">${safe(p.CapRate)}</div></div>
          <div class="stat"><div class="stat-label">GRM</div><div class="stat-value">${safe(p.GRM)}</div></div>
          <div class="stat"><div class="stat-label">Rehab Budget</div><div class="stat-value">${safe(p.RehabBudget)}</div></div>
        </div>
        <div class="featured-strategy">${safe(p.InvestmentStrategy)}</div>
      </div>
    </div>
  `;
}

function renderWaterfall(list){
  const slot = document.getElementById("waterfall-slot");
  if (!list.length){
    slot.innerHTML = `<p class="empty-note">No active properties right now. Check back soon.</p>`;
    return;
  }
  slot.innerHTML = list.map(p => `
    <article class="property-card">
      ${imageBlock(p, "card-media")}
      <div class="card-body">
        <h3>${p.Address}</h3>
        <div class="card-loc">${locationLine(p)} &middot; ${safe(p.PropertyType)}</div>
        <div class="card-stats">
          <div class="card-stat"><div class="stat-label">Market Value</div><div class="stat-value">${safe(p.MarketValue)}</div></div>
          <div class="card-stat"><div class="stat-label">ARV</div><div class="stat-value">${safe(p.ARV)}</div></div>
          <div class="card-stat"><div class="stat-label">Buy-In</div><div class="stat-value">${safe(p.BuyIn)}</div></div>
          <div class="card-stat"><div class="stat-label">Rehab Budget</div><div class="stat-value">${safe(p.RehabBudget)}</div></div>
          <div class="card-stat"><div class="stat-label">Cap Rate</div><div class="stat-value">${safe(p.CapRate)}</div></div>
          <div class="card-stat"><div class="stat-label">GRM</div><div class="stat-value">${safe(p.GRM)}</div></div>
        </div>
        <p class="card-desc">${safe(p.Description)}</p>
        ${p.Notes && p.Notes.trim() ? `<p class="card-note">${p.Notes}</p>` : ""}
        <span class="card-strategy-tag">${safe(p.InvestmentStrategy)}</span>
      </div>
    </article>
  `).join("");
}

function renderSold(list){
  const slot = document.getElementById("sold-slot");
  if (!list.length){
    slot.innerHTML = `<p class="empty-note">No closed deals yet, check back soon.</p>`;
    return;
  }
  slot.innerHTML = list.map(p => `
    <article class="sold-card">
      <div class="closed-banner">CLOSED</div>
      ${imageBlock(p, "sold-media")}
      <div class="sold-body">
        <h4>${p.Address}</h4>
        <div class="card-loc">${locationLine(p)}</div>
        <div class="sold-price">Closed &middot; ${safe(p.MarketValue)}</div>
      </div>
    </article>
  `).join("");
}

function renderAll(data){
  const featured = data.find(p => (p.Status || "").toLowerCase() === "featured");
  const active = data.filter(p => (p.Status || "").toLowerCase() === "active");
  const closed = data.filter(p => (p.Status || "").toLowerCase() === "closed");

  renderFeatured(featured);
  renderWaterfall(active);
  renderSold(closed);
}

/* ==========================================================
   Load data: try the published sheet first, fall back to sample
========================================================== */
async function loadData(){
  if (SHEET_CSV_URL){
    try{
      const res = await fetch(SHEET_CSV_URL, { cache: "no-store" });
      if (!res.ok) throw new Error("Sheet fetch failed: " + res.status);
      const text = await res.text();
      const data = parseCSV(text);
      if (data.length){
        renderAll(data);
        return;
      }
    } catch (err){
      console.warn("Falling back to sample data:", err);
    }
  }
  renderAll(FALLBACK_DATA);
}

document.getElementById("year").textContent = new Date().getFullYear();
loadData();
