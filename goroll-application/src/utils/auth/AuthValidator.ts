export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);

  return isValid;
};

export const validatePassword = (password: string) => {
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[@#$%^&*(),.?":{}|<>_]/.test(password);
  const isValidLength = password.length >= 8 && password.length <= 20;

  const typesCount = [
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
  ].filter(Boolean).length;

  const isValid = isValidLength && typesCount >= 2;

  return {
    isValid,
    isValidLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    typesCount,
  };
};
