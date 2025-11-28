export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  export const validatePassword = (password) => {
    return password && password.length >= 6;
  };
  
  export const validateOTP = (otp) => {
    return /^\d{4}$/.test(otp);
  };
  