# Contact and Metadata Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the LandingPage contact components to use new DB fields (Google Maps link and full Instagram URL) and update the HTML metadata and favicon.

**Architecture:** The frontend React components will be modified to conditionally handle full URLs vs usernames for Instagram, and use `maps_url` for the location card. The static `index.html` file will receive hardcoded metadata updates.

**Tech Stack:** React, HTML

## Global Constraints
- React JSX must be used for frontend changes.
- The user handles the actual database values.

---

### Task 1: Update Frontend Contact Links

**Files:**
- Modify: `src/pages/LandingPage.jsx`

**Interfaces:**
- Consumes: `kontak.maps_url` and `kontak.instagram` properties from the state.
- Produces: Updated JSX layout.

- [ ] **Step 1: Update the Instagram and Facebook links**

In `src/pages/LandingPage.jsx` (around line 988-1000), update the links so they can handle full URLs if present:

```javascript
            <div className="flex gap-3">
              {kontak.instagram && (
                <a href={kontak.instagram.startsWith('http') ? kontak.instagram : `https://instagram.com/${kontak.instagram}`} target="_blank" rel="noopener noreferrer"
                  className="card p-4 flex-1 flex items-center justify-center gap-2 text-sm font-medium text-pink-600 hover:bg-pink-50">
                  <Instagram size={20} /> Instagram
                </a>
              )}
              {kontak.facebook && (
                <a href={kontak.facebook.startsWith('http') ? kontak.facebook : `https://facebook.com/${kontak.facebook}`} target="_blank" rel="noopener noreferrer"
                  className="card p-4 flex-1 flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:bg-blue-50">
                  <Facebook size={20} /> Facebook
                </a>
              )}
            </div>
```

- [ ] **Step 2: Make Lokasi Kantor clickable**

In `src/pages/LandingPage.jsx` (around line 1003-1012), wrap the contents of the `Lokasi Kantor` card in an `<a>` tag that points to `kontak.maps_url`:

```javascript
          <div className="card overflow-hidden h-80 lg:h-auto">
            <a href={kontak.maps_url || '#'} target="_blank" rel="noopener noreferrer" className="w-full h-full bg-gradient-to-br from-almarwa-100 to-almarwa-200 flex items-center justify-center hover:opacity-90 transition-opacity block">
              <div className="text-center p-6">
                <MapPin size={48} className="text-almarwa-400 mx-auto mb-3" />
                <p className="text-almarwa-600 font-semibold">Lokasi Kantor</p>
                <p className="text-sm text-almarwa-400 mt-1">Almarwa Tour & Travel</p>
                <p className="text-xs text-almarwa-300 mt-2">{kontak.alamat}</p>
              </div>
            </a>
          </div>
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/LandingPage.jsx
git commit -m "feat: make location card clickable and improve social link parsing"
```

---

### Task 2: Update Metadata and Favicon

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: `public/logo.png` (already exists in repo)
- Produces: Updated `<head>` section in `index.html`.

- [ ] **Step 1: Edit HTML Metadata**

In `index.html`, replace the existing `<link rel="icon">`, `<title>`, and `<meta name="description">` with the following:

```html
    <link rel="icon" type="image/png" href="/logo.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Al-Marwa Tour & Travel - Umroh & Haji Plus</title>
    <meta name="description" content="Website Resmi Al-Marwa Tour & Travel. Layanan ibadah umroh dan haji plus terpercaya, amanah, dan berkualitas." />
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "chore: update website metadata and favicon"
```
