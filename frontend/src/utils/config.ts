export const API_URL = (
  window.location.hostname === 'localhost'
    ? 'https://api2.docgen.dev'
    : 'https://api1.docgen.dev'
);

export const getBaseUrl = () => window.location.origin;

export const GITHUB_CLIENT_ID = 'Ov23livmcOJdTGJwAtnB';

export const GOOGLE_CALLBACK_URL = window.location.hostname === 'localhost'
  ? 'https://api2.docgen.dev/api/v1/auth/google-auth-callback'
  : 'https://api1.docgen.dev/api/v1/auth/google-auth-callback';

export const GITHUB_CALLBACK_URL = window.location.hostname === 'localhost'
  ? 'https://api2.docgen.dev/api/v1/auth/github-auth-callback'
  : 'https://api1.docgen.dev/api/v1/auth/github-auth-callback';