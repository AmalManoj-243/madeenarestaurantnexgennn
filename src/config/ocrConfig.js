// OCR Configuration - OFFLINE MODE (100% FREE)
export const OCR_CONFIG = {
  // OCR Mode Selection
  OCR_MODE: 'OFFLINE', // Using FREE offline OCR
  
  // Offline OCR Settings
  OFFLINE_OCR_ENABLED: true,
  IMAGE_QUALITY: 0.8,
  DEMO_MODE: false,
  
  // Cloud OCR (Not needed for offline mode)
  // GOOGLE_VISION_API_KEY: 'Not required for offline mode',
  // GOOGLE_VISION_ENDPOINT: 'https://vision.googleapis.com/v1/images:annotate',
};

// Text parsing patterns
export const PARSING_PATTERNS = {
  // Phone number patterns
  PHONE_REGEX: /(\+?\d{1,3}[-.\s]?\d{1,3}[-.\s]?\d{3,4}[-.\s]?\d{3,4})/g,
  
  // Email pattern
  EMAIL_REGEX: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
  
  // UAE Cities
  UAE_CITIES: ['dubai', 'abu dhabi', 'sharjah', 'ajman', 'fujairah', 'ras al khaimah', 'umm al quwain'],
  
  // Business entity indicators
  BUSINESS_INDICATORS: ['LLC', 'Corp', 'Company', 'Trading', 'Group', 'Enterprise', 'Ltd', 'Limited'],
  
  // Address keywords
  ADDRESS_KEYWORDS: ['address', 'office', 'building', 'street', 'road', 'avenue'],
  
  // Phone keywords
  PHONE_KEYWORDS: ['phone', 'tel', 'telephone'],
  
  // Mobile keywords
  MOBILE_KEYWORDS: ['mobile', 'mob', 'cell']
};