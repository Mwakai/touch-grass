// Kid logins: a username and 4-digit PIN that a parent sets. These match the
// backend's rules (touch-grass-backend/src/utils/kidLogin.js).

export const normalizeUsername = (username: string) => username.trim().toLowerCase()

export const usernameError = (username: string) =>
  /^[a-z0-9_]{3,20}$/.test(normalizeUsername(username))
    ? undefined
    : 'Use 3 to 20 letters, numbers or underscores'

export const pinError = (pin: string) => (/^\d{4}$/.test(pin) ? undefined : 'Use exactly 4 digits')
