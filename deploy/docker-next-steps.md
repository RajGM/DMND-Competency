# Docker and Nginx Next Steps

This competency prototype currently runs frontend and mock backend with Node (`npm start`).

For productionization:

1. Build frontend assets using `npm run build`.
2. Serve static assets with Nginx using `deploy/nginx.conf`.
3. Run real backend API separately and proxy `/api/*` through Nginx.
4. Move secrets and API origins to runtime environment variables.
5. Enable HTTPS, secure cookies, and stricter CORS in backend.
