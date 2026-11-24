# ARTT Lawns — Next.js migration

The original PHP mock website migrated to Next.js App Router, React and TypeScript. The original PHP project remains in the parent folder for reference. Run npm commands from this folder.

## Run locally

```powershell
cd artt-lawns
npm install
npm run dev
```

If already in `artt-lawns`, skip the `cd` command. Open http://localhost:3000.

## Production checks

```powershell
npm run build
npm start
```

## File mapping

| Original | Next.js |
| --- | --- |
| `index.php` | `src/app/page.tsx` |
| `about.php` | `src/app/about/page.tsx` |
| `contact.php` | `src/app/contact/page.tsx` |
| `services.php` | `src/app/services/page.tsx` |
| `inc/header.inc` | `src/app/layout.tsx` |
| `inc/nav.inc` | `src/components/Navigation.tsx` |
| `inc/footer.inc` | `src/components/Footer.tsx` |
| `css/style.css` | `src/app/globals.css` |
| Bootstrap carousel behaviour | `src/components/JobCarousel.tsx` |
| `images/*` | `public/images/*` |

The shared layout replaces PHP includes. React and responsive CSS replace Bootstrap's navbar and carousel JavaScript; Bootstrap CDN scripts are no longer needed. Carousels automatically switch every five seconds and have manual controls and a pause button. Automatic animation is disabled for reduced-motion preferences.

The original About, Contact and Services pages had no content; these routes contain labelled placeholders. The original search pointed to a nonexistent `search.php`; `/search` now searches the available page titles and descriptions locally. Old `.php` URLs redirect to their new routes, retaining query strings.

`js/main.js` and `inc/db_connect.inc` were empty, so there was no JavaScript logic or database connection to migrate.

## Quote requests

The homepage form collects name, email, phone, suburb/postcode, service, job details and permission to contact the customer. The hero button jumps to the form. Requests are saved in a SQLite `leads` table in `data/leads.sqlite`, outside the public directory and excluded from Git. The admin dashboard reads and updates the same database.

### Database setup

Use Node.js 24.14 or later. From `artt-lawns`, run `npm run db:setup` to create the database/schema and import legacy JSON enquiries. The application also initializes the database automatically on its first read/write. No separate database service or additional npm dependencies are needed. This uses Node's built-in `node:sqlite`, which is experimental in Node 24 and prints a warning.

Set `LEADS_DATABASE_PATH` in `.env.local` only if you want another file location; the default is `data/leads.sqlite`. Keep it on a persistent local disk, outside `public`. `QUOTE_STORAGE_DIR` now controls only the legacy JSON import directory. The one-time transactional import preserves IDs, statuses, private notes and dates, leaves original files untouched and avoids duplicate imports. Invalid legacy data aborts the migration rather than partially importing it.

The table stores contact details, service, job description, status, private notes, creation and update timestamps. Writes use SQL parameters, status constraints and atomic database updates. SQLite uses WAL mode; use a SQLite-aware backup or stop the application before copying the database and any associated WAL files.

Before accepting requests:

1. Copy `.env.example` to `.env.local`.
2. Set `ADMIN_QUOTE_TOKEN` to a random private key of at least 32 characters. A password manager can generate this. Never prefix it with `NEXT_PUBLIC_` or share it with customers.
3. Restart the Next.js server.
4. Visit `/admin` and sign in with that key. The key is cleared from the form after sign-in; an HTTP-only, SameSite=Strict cookie keeps the session active for eight hours. Use **Sign out** when finished. The old `/admin/quotes` address redirects to the dashboard.

The dashboard provides enquiry counts, status filters, customer/job search, refresh, email/phone links, and private notes. Set an enquiry to New, Contacted, Quoted, Completed or Archived and click **Save changes**. These changes persist alongside the quote record; existing records default to New. Archiving retains customer details rather than deleting them.

All quote reads and updates require server-side authorization. Updates and session changes check request origin. Login attempts have a basic per-process limit. Sessions are signed using the existing admin key; changing that key invalidates all sessions. Logout revocation and login throttling are held in server memory, so this remains a single-server prototype. A restart resets those protections; use a shared session store and established account authentication before a public multi-instance deployment.

If the key is missing or too short, submissions are disabled and display an error rather than claiming to save a request. The admin view shows newest requests first and email links for replying manually. It does not send emails, generate prices or confirm bookings.

This database is for local development or a single Node.js server with a persistent writable disk. Back up and restrict access to customer records. Before deploying to serverless/ephemeral hosting or multiple servers, use a shared hosted database such as PostgreSQL; the local SQLite file will not provide shared persistent storage there. Add production authentication and rate limiting/spam protection. Use HTTPS for deployed admin access.

After building, run `node scripts/test-quotes.mjs` for isolated API checks using temporary customer records. This checks validation, consent, same-origin submission, the spam field, disk storage, cookie sign-in, protected retrieval/updates, status and note persistence, and sign-out.

Run `node scripts/test-database.mjs` to verify legacy imports, duplicate prevention, persistence after reopening, preservation of original JSON files and SQLite integrity. Both tests use isolated temporary databases.

All original images are copied, including images not currently displayed. Starter SVGs are unused.

This is a mock website made with the business owner's permission.
