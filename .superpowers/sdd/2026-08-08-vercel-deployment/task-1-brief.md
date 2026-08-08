### Task 1: Vercel Configuration

**Files:**
- Create: `vercel.json`

**Interfaces:**
- Consumes: N/A
- Produces: Configuration file for Vercel deployment.

**Steps:**
- Write Vercel Configuration:
```json
{
  "builds": [
    { "src": "package.json", "use": "@vercel/static-build" },
    { "src": "server/index.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/server/index.js" },
    { "src": "/uploads/(.*)", "dest": "/server/index.js" },
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

- Commit:
```bash
git add vercel.json
git commit -m "chore: add vercel configuration for express backend"
```
