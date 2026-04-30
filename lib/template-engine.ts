/**
 * Template engine for SM Web Designer.
 *
 * Takes prospect data + resolved variables + stock photos and produces
 * the final HTML using the golden baseline template structure.
 *
 * What this engine handles automatically:
 * - SEO meta tags (title, description, OG, Twitter cards)
 * - Business name, phone, address throughout
 * - Hero wordmark (industry keyword)
 * - Geo-localized H1 headline
 * - Review cards from real Google reviews
 * - Service options in the contact form dropdown
 * - Gallery images from stock photo sets
 * - Footer business info + Startup Miracle attribution
 * - Google Maps embed
 *
 * What Claude/Codex provides per prospect (via the "copy" parameter):
 * - hero_subheadline: 1-2 sentences for hero
 * - intro_headline: "Why Choose Us" section headline
 * - intro_p1, intro_p2: two paragraphs for intro section
 * - services_headline: e.g. "Durable, Stylish Fencing Solutions"
 * - services_subtext: short description next to headline
 * - services: array of { name, description } (3 services + call card)
 * - brand_statement: the centered quote
 * - about_headline, about_text: About section
 * - owner_card_text: text for the owner-operated card
 * - mission, vision, values: accordion content
 * - process_steps: array of { title, description } (4 steps)
 * - form_heading, form_subtext: lead capture form
 * - footer_blurb: short business description for footer
 */

import type { Prospect } from "./types";
import { resolveProspect } from "./prospect-resolver";
import { getPhotosForCategory } from "./stock-photos";

export interface ProspectCopy {
  hero_subheadline: string;
  intro_headline: string;
  intro_p1: string;
  intro_p2: string;
  services_headline: string;
  services_subtext: string;
  services: { name: string; description: string }[];
  brand_statement: string;
  about_headline: string;
  about_text: string;
  owner_card_text: string;
  mission: string;
  vision: string;
  values: string;
  process_steps: { title: string; description: string }[];
  form_heading: string;
  form_subtext: string;
  footer_blurb: string;
}

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function phoneLink(phone: string): string {
  return "tel:+" + phone.replace(/\D/g, "");
}

function initials(name: string): string {
  return name.split(/\s+/).map(w => w[0]?.toUpperCase() || "").join("").slice(0, 2);
}

function stars(rating: number): string {
  const full = Math.floor(rating);
  const remainder = rating - full;
  let s = '<span class="text-brand text-sm">' + "★".repeat(full) + "</span>";
  if (remainder >= 0.5) s += '<span class="text-brand/50 text-sm">★</span>';
  const empty = 5 - full - (remainder >= 0.5 ? 1 : 0);
  if (empty > 0) s += '<span class="text-gray-300 text-sm">' + "★".repeat(empty) + "</span>";
  return s;
}

function formatHours(hours: string[] | null): { line1: string; line2: string } {
  if (!hours || hours.length === 0) return { line1: "Mon–Fri: 8AM – 5PM", line2: "" };
  // Extract first and last day patterns
  const clean = hours.map(h => h.replace(/\u202f/g, " ").replace(/\u2009/g, "").replace(/–/g, "–"));
  const first = clean[0] || "Mon: 8AM – 5PM";
  const sat = clean.find(h => h.startsWith("Sat"));
  const firstTime = first.split(": ").slice(1).join(": ");
  return {
    line1: `Mon–Fri: ${firstTime}`,
    line2: sat ? sat.replace("Saturday", "Sat") : "",
  };
}

export function renderWebsite(
  prospect: Prospect,
  copy: ProspectCopy,
  templateDefaults?: string[]
): string {
  const v = resolveProspect(prospect, templateDefaults);
  const photos = getPhotosForCategory(v.prospect_category);
  const slug = v.prospect_slug;
  const phone = prospect.phone || "";
  const phoneFmt = phone;
  const phoneHref = phoneLink(phone);
  const category = v.prospect_category;
  const categoryUpper = category.charAt(0).toUpperCase() + category.slice(1);
  const wordmark = categoryUpper.toUpperCase();
  const biz = prospect.business_name;
  const bizInitials = initials(biz);
  const city = v.prospect_city;
  const state = v.prospect_state;
  const address = v.prospect_address;
  const rating = prospect.rating || 0;
  const reviewCount = prospect.review_count || 0;
  const reviews = (prospect.reviews_data || []).slice(0, 3);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hours = formatHours((prospect as any).business_hours as string[] | null);
  const services = copy.services.slice(0, 3);
  const serviceNames = services.map(s => s.name);

  // Gallery cards
  const galleryCards = photos.gallery.map((url, i) => {
    const label = photos.galleryLabels[i] || `Project ${i + 1}`;
    return `          <div class="snap-start shrink-0 w-[280px] md:w-[320px] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
            <img src="${url}" alt="${escHtml(label)} in ${escHtml(city)}" class="w-full h-[220px] object-cover" loading="lazy">
            <div class="bg-white p-3">
              <p class="text-sm font-semibold text-ink">${escHtml(label)} — ${escHtml(city)}</p>
              <p class="text-xs text-ink-faint mt-0.5">${escHtml(categoryUpper)} project</p>
            </div>
          </div>`;
  }).join("\n");

  // Review cards
  const reviewCards = reviews.map((r) => {
    const name = r.authorAttribution?.displayName || "Customer";
    const text = (r.text?.text || "").slice(0, 250);
    const ratingNum = r.rating || 5;
    return `        <div class="rounded-xl bg-surface-soft p-6">
          <div class="flex gap-0.5 mb-3">
            ${stars(ratingNum)}
          </div>
          <p class="text-sm text-ink-muted leading-relaxed mb-4">
            "${escHtml(text)}"
          </p>
          <div class="flex items-center gap-3">
            <div class="h-9 w-9 rounded-full bg-brand/15 flex items-center justify-center text-xs font-bold text-brand">${initials(name)}</div>
            <div>
              <p class="text-sm font-semibold text-ink">${escHtml(name)}</p>
              <p class="text-[11px] text-ink-faint">${escHtml(city)}, ${escHtml(state)}</p>
            </div>
          </div>
        </div>`;
  }).join("\n");

  // Service cards (3 regular + 1 call card)
  const serviceCards = services.map((s) => `        <div class="rounded-xl bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition group">
          <div class="h-32 rounded-lg bg-gradient-to-br from-brand-light to-brand/10 mb-4 flex items-center justify-center">
            <svg class="h-10 w-10 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>
          </div>
          <h3 class="font-bold text-ink text-[15px] mb-1">${escHtml(s.name)}</h3>
          <p class="text-xs text-ink-muted leading-relaxed">${escHtml(s.description)}</p>
        </div>`).join("\n");

  // Process steps
  const processSteps = copy.process_steps.slice(0, 4).map((s, i) => `        <div class="rounded-xl bg-white p-5 shadow-sm">
          <span class="text-3xl font-extrabold text-brand/20">0${i + 1}</span>
          <h3 class="font-bold text-ink mt-2 mb-2">${escHtml(s.title)}</h3>
          <p class="text-xs text-ink-muted leading-relaxed">${escHtml(s.description)}</p>
        </div>`).join("\n");

  // Service options for form
  const serviceOptions = serviceNames.map(n => `              <option>${escHtml(n)}</option>`).join("\n");

  // Footer services list
  const footerServices = serviceNames.map(n => `            <li>${escHtml(n)}</li>`).join("\n");

  // Contact owner name
  const ownerName = prospect.contact_name || "the owner";

  // Google Maps embed URL
  const mapsQuery = encodeURIComponent(`${biz} ${city} ${state}`);
  const mapsEmbed = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${mapsQuery}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escHtml(biz)} | Professional ${escHtml(categoryUpper)} in ${escHtml(city)}, ${escHtml(state)}</title>
  <meta name="description" content="${escHtml(biz)} — ${escHtml(city)}'s trusted ${category} company. ${escHtml(copy.services[0]?.name || categoryUpper)}, repair, and more. ${escHtml(String(rating))} stars from ${reviewCount} reviews. Call ${escHtml(phoneFmt)}.">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escHtml(biz)} — Your New Website Is Ready">
  <meta property="og:description" content="Quality ${category} in ${escHtml(city)} built to last. ${escHtml(String(rating))} stars from ${reviewCount} Google reviews. See what your online presence could look like.">
  <meta property="og:image" content="https://demo.startupmiracle.com/og/${slug}.jpg">
  <meta property="og:image:width" content="960">
  <meta property="og:image:height" content="614">
  <meta property="og:image:alt" content="${escHtml(biz)} website preview — quality ${category} in ${escHtml(city)}, ${escHtml(state)}">
  <meta property="og:url" content="https://demo.startupmiracle.com/api/preview/${slug}">
  <meta property="og:site_name" content="Startup Miracle">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escHtml(biz)} — Your New Website Is Ready">
  <meta name="twitter:description" content="Quality ${category} in ${escHtml(city)} built to last. ${escHtml(String(rating))} stars, ${reviewCount} reviews. See your demo site.">
  <meta name="twitter:image" content="https://demo.startupmiracle.com/og/${slug}.jpg">

  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: { DEFAULT: '#f96310', dark: '#d9530c', light: '#fcceb2' },
            surface: { DEFAULT: '#ffffff', soft: '#f5f5f5' },
            ink: { DEFAULT: '#231f23', muted: '#605c5f', faint: '#9e9fa3' }
          },
          fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] }
        }
      }
    }
  </script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    html { scroll-behavior: smooth; }
    @keyframes cta-glow { from { box-shadow: 0 2px 12px rgba(249,99,16,0.35); } to { box-shadow: 0 2px 20px rgba(249,99,16,0.6); } }
  </style>
</head>
<body class="bg-[#f5f3f0] font-sans text-ink antialiased">

  <!-- 1. NAVBAR -->
  <nav id="main-nav" class="sticky top-0 z-50 mx-auto max-w-[960px] rounded-t-2xl border-b border-gray-100 bg-white/95 backdrop-blur-sm mt-5 md:mt-8" style="width:94%">
    <div class="flex items-center justify-between px-6 py-4">
      <div class="flex items-center gap-2.5">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-brand font-bold text-white text-sm">${bizInitials}</div>
        <div class="leading-tight">
          <span class="text-sm font-bold text-ink">${escHtml(biz)}</span>
          <span class="block text-[10px] text-ink-faint">${escHtml(city)}, ${escHtml(state)}</span>
        </div>
      </div>
      <div class="hidden md:flex items-center gap-6 text-sm font-medium text-ink-muted">
        <a href="#services" class="hover:text-brand transition">Services</a>
        <a href="#gallery" class="hover:text-brand transition">Gallery</a>
        <a href="#about" class="hover:text-brand transition">About</a>
        <a href="#reviews" class="hover:text-brand transition">Reviews</a>
      </div>
      <div class="flex items-center gap-3">
        <a href="#contact" class="hidden sm:inline-flex rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark transition shadow-[0_2px_12px_rgba(249,99,16,0.45)] hover:shadow-[0_2px_20px_rgba(249,99,16,0.65)]" style="animation:cta-glow 2s ease-in-out infinite alternate">Contact Us</a>
        <button id="menu-toggle" onclick="document.getElementById('mobile-menu').classList.toggle('hidden')" class="md:hidden flex h-9 w-9 items-center justify-center rounded-lg text-ink hover:bg-gray-100 transition">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>
        </button>
      </div>
    </div>
    <div id="mobile-menu" class="hidden md:hidden border-t border-gray-100 px-6 pb-4">
      <div class="flex flex-col gap-1 pt-2">
        <a href="#services" onclick="document.getElementById('mobile-menu').classList.add('hidden')" class="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted hover:bg-gray-50 hover:text-brand transition">Services</a>
        <a href="#gallery" onclick="document.getElementById('mobile-menu').classList.add('hidden')" class="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted hover:bg-gray-50 hover:text-brand transition">Gallery</a>
        <a href="#about" onclick="document.getElementById('mobile-menu').classList.add('hidden')" class="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted hover:bg-gray-50 hover:text-brand transition">About</a>
        <a href="#reviews" onclick="document.getElementById('mobile-menu').classList.add('hidden')" class="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted hover:bg-gray-50 hover:text-brand transition">Reviews</a>
        <a href="#contact" onclick="document.getElementById('mobile-menu').classList.add('hidden')" class="mt-1 rounded-full bg-brand px-5 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-dark transition shadow-[0_2px_12px_rgba(249,99,16,0.45)]">Contact Us</a>
      </div>
    </div>
  </nav>

  <div class="mx-auto max-w-[960px] overflow-hidden rounded-b-2xl bg-white shadow-lg mb-5 md:mb-8" style="width:94%">

    <!-- 2. HERO -->
    <header class="relative overflow-hidden" style="min-height:540px">
      <div class="absolute inset-0 z-10" style="background:linear-gradient(to right, rgba(249,99,16,0.85) 0%, rgba(217,83,12,0.55) 35%, rgba(0,0,0,0.15) 65%, rgba(0,0,0,0.05) 100%)"></div>
      <div class="absolute inset-0 bg-cover bg-center" style="background-image:url('${photos.hero}')"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 select-none pointer-events-none">
        <span class="text-[120px] md:text-[170px] font-extrabold uppercase text-white/[0.08] leading-none tracking-wider">${wordmark}</span>
      </div>
      <div class="relative z-20 flex flex-col justify-center min-h-[540px] px-6 md:px-12">
        <div class="max-w-lg">
          <div class="inline-flex items-center gap-2 mb-5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-1">
            <span class="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
            <span class="text-[11px] font-semibold uppercase tracking-wider text-white/90">Serving ${escHtml(city)} &amp; surrounding areas</span>
          </div>
          <h1 class="text-3xl md:text-[42px] font-extrabold text-white leading-[1.08] mb-4">
            Quality ${escHtml(categoryUpper)} in ${escHtml(city)} Built to Last for Your Home
          </h1>
          <p class="text-base md:text-lg text-white/80 leading-relaxed mb-7 max-w-md">
            ${escHtml(copy.hero_subheadline)}
          </p>
          <div class="flex flex-col sm:flex-row gap-3">
            <a href="#contact" class="rounded-full bg-white px-7 py-3.5 text-sm font-bold text-ink text-center hover:bg-gray-100 transition">Get Your Free Estimate</a>
            <a href="${phoneHref}" class="rounded-full border border-white/40 px-7 py-3.5 text-sm font-bold text-white text-center hover:bg-white/10 transition">Call ${escHtml(phoneFmt)}</a>
          </div>
        </div>
      </div>
    </header>

    <!-- 3. INTRO -->
    <section class="grid md:grid-cols-[1.4fr_1fr] gap-8 px-6 md:px-12 py-16 items-center">
      <div>
        <p class="text-[11px] font-bold uppercase tracking-widest text-brand mb-3">Why Choose Us</p>
        <h2 class="text-2xl md:text-[34px] font-bold leading-tight text-ink mb-4">${escHtml(copy.intro_headline)}</h2>
        <p class="text-ink-muted text-[15px] leading-relaxed mb-4">${escHtml(copy.intro_p1)}</p>
        <p class="text-ink-muted text-[15px] leading-relaxed">${escHtml(copy.intro_p2)}</p>
      </div>
      <div class="rounded-xl overflow-hidden aspect-[4/3] relative">
        <img src="${photos.intro}" alt="${escHtml(categoryUpper)} work in ${escHtml(city)}" class="absolute inset-0 w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        <div class="absolute inset-0 bg-gradient-to-b from-black/50 via-black/15 to-transparent" style="height:40%"></div>
        <div class="relative h-full flex items-end p-6">
          <div class="text-white">
            <div class="text-4xl font-extrabold">${rating}<span class="text-brand">★</span></div>
            <p class="text-sm text-white/90 mt-1 font-medium">${reviewCount} Google Reviews</p>
            <p class="text-xs text-white/60 mt-0.5">${escHtml(city)}, ${escHtml(state)}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. SERVICES -->
    <section id="services" class="px-6 md:px-12 py-16 bg-surface-soft">
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <p class="text-[11px] font-bold uppercase tracking-widest text-brand mb-2">What We Do</p>
          <h2 class="text-2xl md:text-[34px] font-bold leading-tight text-ink">${escHtml(copy.services_headline)}</h2>
        </div>
        <p class="text-sm text-ink-muted max-w-xs">${escHtml(copy.services_subtext)}</p>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
${serviceCards}
        <!-- Call Card -->
        <div class="rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition text-white relative">
          <img src="${photos.callCard}" alt="Call us" class="absolute inset-0 w-full h-full object-cover">
          <div class="absolute inset-0 bg-brand/80"></div>
          <div class="relative p-5">
            <div class="h-32 rounded-lg bg-white/15 mb-4 flex items-center justify-center">
              <svg class="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/></svg>
            </div>
            <h3 class="font-bold text-[15px] mb-1">Call for Free Estimate</h3>
            <p class="text-xs text-white/80 leading-relaxed mb-3">Talk to ${escHtml(ownerName)} directly. Same-day estimates available.</p>
            <a href="${phoneHref}" class="inline-block rounded-full bg-white px-4 py-2 text-xs font-bold text-brand hover:bg-gray-100 transition">${escHtml(phoneFmt)}</a>
          </div>
        </div>
      </div>
    </section>

    <!-- 4b. PROJECT GALLERY -->
    <section id="gallery" class="px-6 md:px-12 pt-16 pb-8">
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <p class="text-[11px] font-bold uppercase tracking-widest text-brand mb-2">Our Work</p>
          <h2 class="text-2xl md:text-[34px] font-bold leading-tight text-ink">Recent ${escHtml(categoryUpper)} Projects in ${escHtml(city)}</h2>
        </div>
        <p class="text-sm text-ink-muted max-w-xs">Swipe through real projects completed by the ${escHtml(biz)} crew.</p>
      </div>
      <div class="relative">
        <div id="gallery-track" class="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 -mx-2 px-2" style="scrollbar-width:none;-ms-overflow-style:none;">
          <style>#gallery-track::-webkit-scrollbar{display:none}</style>
${galleryCards}
        </div>
        <button onclick="document.getElementById('gallery-track').scrollBy({left:-340,behavior:'smooth'})" class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md text-ink hover:bg-brand hover:text-white transition">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
        </button>
        <button onclick="document.getElementById('gallery-track').scrollBy({left:340,behavior:'smooth'})" class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md text-ink hover:bg-brand hover:text-white transition">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
        </button>
      </div>
      <script>(function(){var t=document.getElementById('gallery-track');if(!t)return;t.addEventListener('scroll',function(){if(t.scrollLeft+t.clientWidth>=t.scrollWidth-10){var items=t.querySelectorAll('.snap-start');for(var i=0;i<Math.min(4,items.length);i++){t.appendChild(items[i].cloneNode(true))}}})})();</script>
    </section>

    <!-- 5. BRAND STATEMENT -->
    <section class="px-6 md:px-12 pt-8 pb-16">
      <div class="rounded-2xl bg-gradient-to-r from-brand-light via-white to-brand-light/60 px-8 md:px-16 py-12 text-center">
        <p class="text-lg md:text-xl font-bold text-ink leading-relaxed max-w-[760px] mx-auto">${escHtml(copy.brand_statement)}</p>
      </div>
    </section>

    <!-- 6. ABOUT -->
    <section id="about" class="px-6 md:px-12 py-16 grid md:grid-cols-3 gap-8 items-start">
      <div>
        <p class="text-[11px] font-bold uppercase tracking-widest text-brand mb-2">About Us</p>
        <h2 class="text-2xl md:text-[34px] font-bold leading-tight text-ink mb-4">${escHtml(copy.about_headline)}</h2>
        <p class="text-sm text-ink-muted leading-relaxed mb-5">${escHtml(copy.about_text)}</p>
        <a href="#contact" class="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-dark transition">
          More About Us <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
        </a>
      </div>
      <div class="rounded-xl overflow-hidden aspect-[3/4] relative">
        <img src="${photos.about}" alt="${escHtml(ownerName)}, owner of ${escHtml(biz)}" class="absolute inset-0 w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        <div class="relative h-full flex items-end p-6">
          <div class="bg-white/90 backdrop-blur rounded-xl p-4 w-full">
            <p class="text-xs font-bold text-brand uppercase tracking-wider mb-1">Owner-Operated</p>
            <p class="text-sm text-ink font-semibold">${escHtml(copy.owner_card_text)}</p>
          </div>
        </div>
      </div>
      <div class="space-y-3">
        <details open class="group rounded-xl overflow-hidden">
          <summary class="flex items-center justify-between cursor-pointer bg-brand text-white px-5 py-4 font-semibold text-sm">Our Mission <svg class="h-4 w-4 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg></summary>
          <div class="bg-brand/5 px-5 py-4 text-sm text-ink-muted leading-relaxed">${escHtml(copy.mission)}</div>
        </details>
        <details class="group rounded-xl overflow-hidden">
          <summary class="flex items-center justify-between cursor-pointer bg-white border border-gray-200 text-ink px-5 py-4 font-semibold text-sm">Our Vision <svg class="h-4 w-4 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg></summary>
          <div class="bg-surface-soft px-5 py-4 text-sm text-ink-muted leading-relaxed">${escHtml(copy.vision)}</div>
        </details>
        <details class="group rounded-xl overflow-hidden">
          <summary class="flex items-center justify-between cursor-pointer bg-white border border-gray-200 text-ink px-5 py-4 font-semibold text-sm">Our Values <svg class="h-4 w-4 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg></summary>
          <div class="bg-surface-soft px-5 py-4 text-sm text-ink-muted leading-relaxed">${escHtml(copy.values)}</div>
        </details>
      </div>
    </section>

    <!-- 7. PROCESS -->
    <section id="process" class="px-6 md:px-12 py-16 bg-surface-soft">
      <div class="mb-10">
        <p class="text-[11px] font-bold uppercase tracking-widest text-brand mb-2">How It Works</p>
        <h2 class="text-2xl md:text-[34px] font-bold leading-tight text-ink">Our Simple Process</h2>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
${processSteps}
      </div>
    </section>

    <!-- 8. TESTIMONIALS -->
    <section id="reviews" class="px-6 md:px-12 py-16">
      <div class="text-center mb-10">
        <p class="text-[11px] font-bold uppercase tracking-widest text-brand mb-2">Real Reviews</p>
        <h2 class="text-2xl md:text-[34px] font-bold leading-tight text-ink">Clients Speak for Us</h2>
      </div>
      <div class="grid md:grid-cols-3 gap-4">
${reviewCards}
      </div>
    </section>

    <!-- 9. CONTACT -->
    <section id="contact" class="relative overflow-hidden rounded-xl mx-4 md:mx-8 mb-8">
      <div class="absolute inset-0 bg-gradient-to-br from-brand-dark via-brand to-brand-dark/90 z-0"></div>
      <div class="relative z-10 grid md:grid-cols-[1.2fr_1fr] gap-8 p-6 md:p-10">
        <div class="rounded-xl bg-white p-6 shadow-lg">
          <h3 class="text-lg font-bold text-ink mb-1">${escHtml(copy.form_heading)}</h3>
          <p class="text-xs text-ink-faint mb-5">${escHtml(copy.form_subtext)}</p>
          <form class="space-y-3" onsubmit="event.preventDefault(); alert('Thank you! ${escHtml(ownerName)} will call you back shortly.');">
            <div class="grid sm:grid-cols-2 gap-3">
              <input type="text" placeholder="First Name" required class="rounded-full border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 w-full">
              <input type="text" placeholder="Last Name" class="rounded-full border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 w-full">
            </div>
            <input type="email" placeholder="Email Address" class="rounded-full border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 w-full">
            <input type="tel" placeholder="Phone" required class="rounded-full border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 w-full">
            <input type="text" placeholder="Street Address" class="rounded-full border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 w-full">
            <div class="grid sm:grid-cols-2 gap-3">
              <input type="text" placeholder="City" value="${escHtml(city)}" class="rounded-full border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 w-full">
              <input type="text" placeholder="Zip Code" class="rounded-full border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 w-full">
            </div>
            <select class="rounded-full border border-gray-200 px-4 py-2.5 text-sm text-ink-muted outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 w-full">
              <option value="">Select Service Needed</option>
${serviceOptions}
              <option>Other</option>
            </select>
            <label class="flex items-start gap-2 text-[11px] text-ink-faint cursor-pointer">
              <input type="checkbox" class="mt-0.5 accent-brand">
              I consent to receiving SMS updates about my estimate.
            </label>
            <button type="submit" class="w-full rounded-full bg-brand py-3 text-sm font-bold text-white hover:bg-brand-dark transition">Request Free Estimate</button>
          </form>
        </div>
        <div class="flex flex-col justify-center text-white">
          <h2 class="text-2xl md:text-3xl font-bold mb-6">Let's Connect</h2>
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/></svg>
              </div>
              <a href="${phoneHref}" class="text-lg font-semibold hover:underline">${escHtml(phoneFmt)}</a>
            </div>
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
              </div>
              <div>
                <p class="font-medium">${escHtml(address.split(",")[0] || address)}</p>
                <p class="text-sm text-white/70">${escHtml(city)}, ${escHtml(state)}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <div>
                <p class="font-medium">${escHtml(hours.line1)}</p>
                ${hours.line2 ? `<p class="text-sm text-white/70">${escHtml(hours.line2)}</p>` : ""}
              </div>
            </div>
          </div>
          <div class="mt-6 rounded-xl overflow-hidden border-2 border-white/20">
            <iframe src="${mapsEmbed}" width="100%" height="180" style="border:0" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
          </div>
        </div>
      </div>
    </section>

    <!-- 10. FOOTER -->
    <footer class="bg-white border-t border-gray-100 px-6 md:px-12 py-10 relative overflow-hidden">
      <div class="absolute bottom-0 left-1/2 -translate-x-1/2 select-none pointer-events-none">
        <span class="text-[80px] md:text-[120px] font-extrabold uppercase text-ink/[0.03] leading-none tracking-widest">${escHtml(biz.toUpperCase())}</span>
      </div>
      <div class="relative z-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <div class="flex items-center gap-2 mb-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand font-bold text-white text-xs">${bizInitials}</div>
            <span class="text-sm font-bold text-ink">${escHtml(biz)}</span>
          </div>
          <p class="text-xs text-ink-muted leading-relaxed">${escHtml(copy.footer_blurb)}</p>
        </div>
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-ink-faint mb-3">Sections</h4>
          <ul class="space-y-2 text-sm text-ink-muted">
            <li><a href="#" class="hover:text-brand transition">Home</a></li>
            <li><a href="#services" class="hover:text-brand transition">Services</a></li>
            <li><a href="#about" class="hover:text-brand transition">About</a></li>
            <li><a href="#reviews" class="hover:text-brand transition">Reviews</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-ink-faint mb-3">Services</h4>
          <ul class="space-y-2 text-sm text-ink-muted">
${footerServices}
          </ul>
        </div>
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-ink-faint mb-3">Contact</h4>
          <ul class="space-y-2 text-sm text-ink-muted">
            <li><a href="${phoneHref}" class="hover:text-brand transition">${escHtml(phoneFmt)}</a></li>
            <li>${escHtml(address.split(",")[0] || address)}</li>
            <li>${escHtml(city)}, ${escHtml(state)}</li>
          </ul>
        </div>
      </div>
      <div class="relative z-10 mt-8 pt-6 border-t border-gray-100 text-center text-[11px] text-ink-faint space-y-1.5">
        <p>&copy; <script>document.write(new Date().getFullYear())</script> ${escHtml(biz)}. All rights reserved.</p>
        <p>This website is powered by <a href="https://startupmiracle.com/" target="_blank" rel="noopener noreferrer" class="font-medium text-brand hover:text-brand-dark transition">Startup Miracle</a></p>
      </div>
    </footer>

  </div>
</body>
</html>`;
}
