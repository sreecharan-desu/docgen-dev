export const API_URL = import.meta.env.VITE_API_URL || (
  window.location.hostname === 'localhost' 
    ? 'http://localhost:8081'
    : 'https://api1.docgen.dev'
)

export const getBaseUrl = () => window.location.origin

export const GOOGLE_CALLBACK_URL = (() => {
  const hostname = window.location.hostname
  if (hostname === 'localhost') {
    return 'http://localhost:8081/api/v1/auth/google-auth-callback'
  } else if (hostname === 'www.docgen.dev') {
    return 'https://api1.docgen.dev/api/v1/auth/google-auth-callback'
  } else {
    // For other environments, construct based on API_URL
    return `${API_URL}/api/v1/auth/google-auth-callback`
  }
})()
// export const GOOGLE_CALLBACK_URL = import.meta.env.VITE_GOOGLE_CALLBACK_URL || 'https://api1.docgen.dev/api/v1/auth/google-auth-callback' 

export const GITHUB_CALLBACK_URL = (() => {
  const hostname = window.location.hostname
  if (hostname === 'localhost') {
    return 'http://localhost:8081/api/v1/auth/github-auth-callback'
  } else if (hostname === 'www.docgen.dev') {
    return 'https://api1.docgen.dev/api/v1/auth/github-auth-callback'
  } else {
    // For other environments, construct based on API_URL
    return `${API_URL}/api/v1/auth/github-auth-callback`
  }
})() 