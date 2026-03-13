# Ghost Sites

Static acquisition sites for the `ghost` portfolio.

Domains:
- `implantsalbania.com`
- `hairtransplantsalbania.com`
- `veneersalbania.com`

Deployment model:
- one Dokploy static application per domain
- one folder per site
- each site posts qualified leads to `https://albaniamedicaldirectory.com/api/contact/lead-intake`
- each site can emit GA4 pageview, CTA, and lead events once `gaMeasurementId` is set in `window.SITE_CONFIG`

Folders:
- `implantsalbania.com/`
- `hairtransplantsalbania.com/`
- `veneersalbania.com/`

Each site is plain HTML/CSS/JS so Dokploy can deploy it with `Build Type: Static`.

Google setup:
- create one GA4 property per domain
- add the property Measurement ID into that site's `window.SITE_CONFIG.gaMeasurementId`
- verify each domain in Search Console via DNS TXT at Namecheap
