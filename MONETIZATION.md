# Multi-Converter — Monetization & Architecture Plan

## 1. Monetization Strategy
The Multi-Converter uses a freemium model:
- **Core conversion tools remain free.**
- **Free users support the platform via advertisements.**
- **Premium features (Pro)** will be introduced later as an optional paid upgrade.
- **Initial MVP prioritizes usability, near-zero operating costs, and user acquisition.**

> **Main Principle:** *«Free users get useful conversion tools with reasonable limits. Pro users get a faster, cleaner, and more powerful experience.»*

---

## 2. Free Plan vs Future Pro Plan

| Feature | Free (MVP) | Future Pro |
|---|---|---|
| Image conversion (WebP, PNG, JPEG) | Yes | Yes |
| Image compression & resizing | Yes | Yes (Advanced options) |
| Images → PDF | Yes (Up to 5 images) | Yes (Unlimited) |
| JSON ↔ YAML | Yes | Yes |
| Base64 & URL Encoding | Yes | Yes |
| UUID Generator | Yes | Yes |
| Ads | Yes | No Ads |
| Account Requirement | No (Frictionless) | Yes (for subscription & API) |
| Max File Size | 25 MB | 500 MB+ |
| Max Batch Total | 50 MB | 2 GB+ |
| Permanent File Storage | None (Client-Local) | Optional Cloud Sync |

---

## 3. Advertising Strategy & Layout

### 3.1 Header Advertisement
- Positioned below the brand header and above the converter workspace.
- `728x90` on desktop, `320x50` / `300x50` responsive banner on mobile.

### 3.2 Content Section Advertisement
- Placed between converter functionality and informational/educational/SEO sections.
- Non-blocking, preserves user reading flow.

### 3.3 Desktop Sidebar Advertisement
- `300x250` Medium Rectangle in a sticky desktop sidebar.
- Automatically hidden on tablet/mobile screens (`@media (max-width: 1024px)`).

### 3.4 Post-Conversion Advertisement
- Placed **strictly below** the file download action area.
- Download button is never hidden or gated behind ad clicks.

---

## 4. Ads That Must Never Be Used
- No forced ad clicks or artificial wait timers.
- No fake download buttons or disguised system notifications.
- No pop-unders or full-screen interstitials during processing.

---

## 5. Technical Architecture: Client-Side Processing
All core MVP conversions are handled in-browser:
- **Images:** HTML5 Canvas API + `createImageBitmap()` (lossless/lossy compression, WebP/JPEG/PNG).
- **Documents:** `pdf-lib` (client-side PDF generation & image embedding).
- **Data formats:** `js-yaml` + native Web Crypto (`crypto.randomUUID()`) + `btoa`/`atob`.
- **Zero server costs:** User device handles memory and compute. Zero backend bandwidth bills for conversions.
