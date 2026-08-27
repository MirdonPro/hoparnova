# HoparNova

Source for the HoparNova website at https://hoparnova.com.

## Hosting

This is a static site deployed with GitHub Pages from the `main` branch through `.github/workflows/deploy.yml`.

## Custom domain

The intended custom domain is `hoparnova.com`.

For the apex domain, configure these DNS A records:

- `185.199.108.153`
- `185.199.109.153`
- `185.199.110.153`
- `185.199.111.153`

For `www`, create a CNAME to `MirdonPro.github.io`.

Then open **Repository Settings → Pages**, set the custom domain to `hoparnova.com`, and enable HTTPS once GitHub makes the option available.
