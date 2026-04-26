export interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}

export function validateEmail(email: string): string | null {
  if (!email) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  return null;
}

export function validateName(name: string): string | null {
  if (!name?.trim()) return 'Name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  if (name.trim().length > 50) return 'Name must be less than 50 characters';
  if (!/^[a-zA-Z\s'-]+$/.test(name)) return 'Name can only contain letters, spaces, and hyphens';
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone) return null;
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,14}$/;
  if (!phoneRegex.test(phone)) return 'Please enter a valid phone number';
  return null;
}

export interface RegisterInput {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export function validateRegistration(input: RegisterInput): Record<string, string> {
  const errors: Record<string, string> = {};

  const emailError = validateEmail(input.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(input.password);
  if (passwordError) errors.password = passwordError;

  if (input.password !== input.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  const firstNameError = validateName(input.firstName);
  if (firstNameError) errors.firstName = firstNameError;

  const lastNameError = validateName(input.lastName);
  if (lastNameError) errors.lastName = lastNameError;

  if (input.phone) {
    const phoneError = validatePhone(input.phone);
    if (phoneError) errors.phone = phoneError;
  }

  return errors;
}

export function validateLogin(input: LoginInput): Record<string, string> {
  const errors: Record<string, string> = {};

  const emailError = validateEmail(input.email);
  if (emailError) errors.email = emailError;

  if (!input.password) errors.password = 'Password is required';

  return errors;
}