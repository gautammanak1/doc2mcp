# Quick Start Guide

## What's New

This enhanced version of doc2mcp includes:
- ✅ **Gmail OAuth + Password Authentication**
- ✅ **Protected Admin Dashboard** (gautammanak1@gmail.com / Coder@123)
- ✅ **Auth Inference** - Automatically detect authentication methods from docs
- ✅ **Workflow Detection** - Identify use cases and workflows
- ✅ **Smart Tool Compression** - Optimize tokens by 20-40%
- ✅ **Multi-Doc Parser** - Understand relationships between documents
- ✅ **Live Processing UI** - Real-time streaming logs with progress
- ✅ **API Graph Visualization** - Visual architecture diagrams
- ✅ **Workflow Diagrams** - Step-by-step workflow visualization

## 5-Minute Setup

### 1. Install Dependencies
```bash
cd /vercel/share/v0-project
pnpm install
```

### 2. Set Environment Variables
Create `.env.local`:
```env
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
ASI_ONE_API_KEY=your-asi-api-key
POSTGRES_URL=your-database-url
ADMIN_EMAIL=gautammanak1@gmail.com

# Optional: Gmail OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

### 3. Run Database
```bash
pnpm db:migrate
```

### 4. Start Server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## First Steps

### Login
- **Email**: gautammanak1@gmail.com
- **Password**: Coder@123
- Or create a new account

### Access Admin Panel
After logging in with admin account:
- Dashboard with stats and analytics
- User management
- Project management
- System metrics

### Create and Analyze a Project
1. Go to Projects → New Project
2. Enter documentation URL (e.g., Stripe, LangChain)
3. Click "Analyze"
4. Watch real-time processing
5. View API graph, workflows, and auth methods

---

## File Changes Summary

| Component | Files | Purpose |
|-----------|-------|---------|
| Auth | `app/(auth)/auth.ts` | Gmail OAuth + Password login |
| Admin | `app/admin/**` | Admin dashboard (protected) |
| AI Analysis | `lib/ai/**` | Auth inference, workflows, compression |
| Streaming | `components/processing/**` | Live logs with SSE |
| Visualization | `components/visualization/**` | API graphs and workflows |
| Database | `lib/db/queries.ts` | Admin queries |
| Processing | `app/api/process/**` | Real-time processing API |

---

## Testing

### Admin Access
```bash
Login → Email: gautammanak1@gmail.com, Password: Coder@123
Navigate → http://localhost:3000/admin
```

### Create Project
```bash
Login → Projects → New
URL: https://stripe.com/docs
Click: Analyze
Watch: Real-time processing in Analysis tab
```

### View Results
```bash
API Graph → Shows system architecture
Workflows → Shows use case workflows
Authentication → Shows detected auth methods
```

---

## Configuration

### Gmail OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credential (Web application)
3. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy credentials to `.env.local`

### Database
Currently supports Supabase PostgreSQL. Update `POSTGRES_URL` with your connection string.

### API Keys
- `ASI_ONE_API_KEY` - Required for AI analysis
- `GOOGLE_CLIENT_ID/SECRET` - Optional but recommended

---

## Key Features

### 🔐 Authentication
- Password-based login with bcrypt
- Gmail OAuth integration
- Secure sessions with HTTP-only cookies

### 📊 Admin Dashboard
- System statistics
- User management
- Project analytics
- Database insights

### 🤖 AI Analysis
| Feature | Input | Output |
|---------|-------|--------|
| Auth Inference | Docs | Auth methods, format, scopes |
| Workflow Detection | Docs | Step workflows, use cases |
| Tool Compression | Tools | Reduced tokens, suggestions |
| Multi-Doc Parser | Multiple docs | Relationships, glossary, flows |

### 📈 Real-Time UI
- Streaming logs via Server-Sent Events
- Live progress tracking
- Token counting
- Time estimation

### 📊 Visualizations
- SVG-based API architecture graphs
- Workflow diagrams with steps
- Interactive legend and statistics
- Color-coded components

---

## Architecture

```
User Input (Documentation URL)
    ↓
Auth Inference ──→ Detect auth methods
    ↓
Workflow Detection ──→ Find use cases
    ↓
Tool Compression ──→ Optimize tokens
    ↓
Multi-Doc Parser ──→ Understand relationships
    ↓
Live Processing UI ──→ Stream results
    ↓
Visualizations ──→ API Graph + Workflows
    ↓
MCP Server Ready
```

---

## Troubleshooting

### "ADMIN_EMAIL not in database"
- Verify email matches environment variable exactly
- Create account with that email first
- Check .env.local for typos

### "OAuth not working"
- Ensure GOOGLE_CLIENT_ID/SECRET are in .env.local
- Check Google Cloud redirect URI matches exactly
- Clear browser cookies

### "Streaming logs not updating"
- Check browser DevTools Network tab
- Verify SSE endpoint is accessible
- Look for CORS errors

### "Database connection failed"
- Test POSTGRES_URL connection
- Run `pnpm db:migrate`
- Check database is running

---

## Next Steps

1. Deploy to Vercel: `vercel deploy`
2. Set environment variables in Vercel Settings
3. Configure custom domain
4. Enable analytics and monitoring
5. Set up GitHub integration for CI/CD

---

## Support

For issues or questions:
1. Check IMPLEMENTATION_GUIDE.md for detailed docs
2. Review error logs in browser console
3. Check Docker logs if running in container
4. Verify all environment variables are set

---

**Happy analyzing! 🚀**
