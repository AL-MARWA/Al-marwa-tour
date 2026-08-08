# Website Updates Design Spec

## Overview
Update the Al-Marwa Tour website to support dynamic Google Maps links, flexible Instagram URLs, update website metadata, and change the favicon to the main logo. The user will handle updating the actual contact values (WhatsApp, Email, Address, Maps URL, Instagram URL) directly in the Supabase database.

## 1. Frontend Updates (`src/pages/LandingPage.jsx`)
- **Lokasi Kantor (Google Maps):**
  The current static `div` card for "Lokasi Kantor" will be wrapped in an `<a>` tag.
  - **Href:** Will use `kontak.maps_url`.
  - **Behavior:** Opens in a new tab (`target="_blank" rel="noopener noreferrer"`).
  - **Styling:** Will include a hover effect (e.g., `hover:opacity-90`) to indicate it's clickable.

- **Instagram Link:**
  The current Instagram link assumes the database only stores a username (`https://instagram.com/${kontak.instagram}`). 
  - **Change:** It will be updated to check if the database value starts with `http`. If it does, it will use the full URL. If not, it will fall back to appending it to the Instagram base URL.

## 2. Metadata & Favicon (`index.html`)
- **Favicon:** Change `<link rel="icon" href="/logo-icon.svg" />` to `<link rel="icon" type="image/png" href="/logo.png" />`.
- **Title & Description:** Update the metadata to improve SEO. 
  - **Title:** `Al-Marwa Tour & Travel - Umroh & Haji Plus`
  - **Description:** `Website Resmi Al-Marwa Tour & Travel. Layanan ibadah umroh dan haji plus terpercaya, amanah, dan berkualitas.`

## 3. Database Updates
- **(Out of Scope for Code):** The user will manually update the `kontak` table in Supabase to fill in the new WhatsApp number, Email, Alamat, `maps_url`, and `instagram` URL.
