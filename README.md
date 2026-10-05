# JobPortal Frontend

A portfolio-ready React/Vite frontend for the Spring Boot JobPortal backend.

## Run

```bash
npm install
cp .env.example .env
npm run dev
```

Frontend: http://localhost:5173  
Backend expected: http://localhost:8080

Set `VITE_API_BASE_URL` if your Spring Boot server uses another URL.

## Important backend notes

This frontend currently sends the custom `check: 1234`, `body: 1234`, and `role` headers because the supplied backend `LoggingFilter` and `AuthorizationAspect` require them.

For a public/production deployment, remove those hard-coded security headers from the backend and rely on JWT/Spring Security for authorization. Also move DB/JWT secrets to environment variables and never commit real secrets.

The UI has a demo fallback on the Jobs page so the design can still be previewed when the backend is offline.
