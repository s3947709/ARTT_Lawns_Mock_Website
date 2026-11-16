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

`js/main.js` and `inc/db_connect.inc` were empty, so there was no JavaScript logic or database connection to migrate. This migration does not add a database, authentication, email delivery or a quote form. Next.js supports those server features when implemented.

All original images are copied, including images not currently displayed. Starter SVGs are unused.

This is a mock website made with the business owner's permission.
