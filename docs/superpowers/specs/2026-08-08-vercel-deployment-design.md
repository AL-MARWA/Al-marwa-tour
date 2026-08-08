# Vercel Deployment & Supabase Storage Setup Design

## 1. Overview
The Al-Marwa Tour website (Vite + React + Express) is failing to register/login on Vercel, and local file uploads will not persist due to Vercel's read-only serverless environment. This design specifies the configuration needed to correctly route API requests to the Express backend and migrate file uploads to Supabase Storage.

## 2. Architecture & Approach
- **Vercel Routing**: A `vercel.json` file will instruct Vercel to treat `server/index.js` as a serverless function, intercepting all `/api/*` requests so they do not fall back to the Vite frontend.
- **Supabase Storage**: The local Multer disk storage will be replaced with Multer memory storage. The file buffer will then be uploaded to a Supabase Storage bucket named `uploads`. The public URL will be retrieved and saved in the database.
- **RLS (Row Level Security)**: Since the backend uses `SUPABASE_SERVICE_ROLE_KEY`, it bypasses RLS. RLS can be turned on with no policies to secure the database from unauthorized client-side access, while keeping the backend fully functional. The `uploads` bucket in Supabase Storage must be set to Public.

## 3. Components to Modify

### 3.1. `vercel.json` (New File)
- Create at the root directory.
- Configure `builds` for `@vercel/static-build` (frontend) and `@vercel/node` (backend).
- Set `rewrites` to direct `/api/(.*)` to `server/index.js`.

### 3.2. `server/index.js`
- **Multer Configuration**: Change from `multer.diskStorage` to `multer.memoryStorage`.
- **Upload Routes** (`/api/jamaah/dokumen`, `/api/jamaah/pembayaran`, `/api/admin/galeri`):
  - Receive the file buffer from `req.file.buffer`.
  - Use `supabaseAdapter` to upload the buffer to the `uploads` bucket.
  - Obtain the public URL of the uploaded file and save it to the database (replacing local `/uploads/...` paths).
- **Express Listen**: Add a check `if (process.env.NODE_ENV !== 'production')` around `app.listen()` to prevent port conflict errors inside Vercel's serverless environment.

### 3.3. `server/db_supabase.js`
- Add an `uploadFile(bucket, filePath, fileBuffer, mimeType)` method to interact with `this.client.storage`.
- Add a method to get the public URL of the uploaded file.

## 4. Setup Instructions for User (Post-Implementation)
- Create a storage bucket named `uploads` in the Supabase Dashboard and set it to **Public**.
- Ensure RLS is enabled for all tables in Supabase for better security (optional but recommended).

## 5. Risk & Error Handling
- **Missing File Error**: Handle cases where users do not upload a file.
- **Upload Failures**: If Supabase Storage upload fails, return a 500 error to the client gracefully.
