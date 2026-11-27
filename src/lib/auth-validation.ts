export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

export function passwordsMatch(password: string, confirmation: string): boolean {
  return password === confirmation;
}

export function isValidFullName(name: string): boolean {
  return name.trim().length > 0;
}
