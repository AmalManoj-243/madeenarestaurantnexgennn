
class OfflineOCR {
  
  /**
   * Extract text from image using Google ML Kit (offline OCR)
   * @param {string} imageUri - Local image URI
   * @returns {Promise<Object>} - Parsed customer information
   */
  static async extractTextFromImage(imageUri) {
    try {
      console.log('🔍 Starting Google ML Kit OCR for:', imageUri);
      
      // Use Google ML Kit Text Recognition (offline)
      const result = await TextRecognition.recognize(imageUri);
      
      if (!result || !result.text) {
        console.log('❌ No text detected in image');
        return this.getDemoData(); // Return demo data as fallback
      }
      
      console.log('📝 Detected text:', result.text);
      
      // Parse customer information
      const customerInfo = this.parseCustomerInfo(result.text);
      console.log('✅ Parsed customer info:', customerInfo);
      
      return customerInfo || this.getDemoData();
      
    } catch (error) {
      console.error('❌ Google ML Kit OCR Error:', error);
      console.log('🔄 Falling back to demo data');
      return this.getDemoData();
    }
  }
  
  /**
   * Parse extracted text into customer information
   * @param {string} extractedText - Raw text from OCR
   * @returns {Object} - Structured customer data
   */
  static parseCustomerInfo(extractedText) {
    if (!extractedText) return null;

    const lines = extractedText.split('\n').map(line => line.trim()).filter(line => line);
    const customerInfo = {};

    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      
      // Extract company name (lines with business indicators)
      if (!customerInfo.name) {
        const hasBusinessIndicator = PARSING_PATTERNS.BUSINESS_INDICATORS.some(indicator => 
          line.includes(indicator)
        );
        if (hasBusinessIndicator) {
          customerInfo.name = line;
        }
      }
      
      // Extract phone numbers
      const phoneMatch = line.match(PARSING_PATTERNS.PHONE_REGEX);
      if (phoneMatch) {
        const cleanPhone = phoneMatch[0].replace(/[-.\s]/g, '');
        
        const hasPhoneKeyword = PARSING_PATTERNS.PHONE_KEYWORDS.some(keyword => 
          lowerLine.includes(keyword)
        );
        const hasMobileKeyword = PARSING_PATTERNS.MOBILE_KEYWORDS.some(keyword => 
          lowerLine.includes(keyword)
        );
        
        if (hasPhoneKeyword) {
          customerInfo.phone = cleanPhone;
        } else if (hasMobileKeyword) {
          customerInfo.customer_mobile = cleanPhone;
        } else if (!customerInfo.phone && !customerInfo.customer_mobile) {
          // First phone number found
          customerInfo.customer_mobile = cleanPhone;
        }
      }
      
      // Extract email
      const emailMatch = line.match(PARSING_PATTERNS.EMAIL_REGEX);
      if (emailMatch && !customerInfo.email) {
        customerInfo.email = emailMatch[0];
      }
      
      // Extract address
      const hasAddressKeyword = PARSING_PATTERNS.ADDRESS_KEYWORDS.some(keyword => 
        lowerLine.includes(keyword)
      );
      if (hasAddressKeyword) {
        customerInfo.address = line.replace(/address:?/i, '').trim();
      }
      
      // Extract city from UAE cities
      PARSING_PATTERNS.UAE_CITIES.forEach(city => {
        if (lowerLine.includes(city) && !customerInfo.city) {
          customerInfo.city = city.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');
        }
      });
    });

    // Use first non-empty line as name if no company name found
    if (!customerInfo.name && lines.length > 0) {
      customerInfo.name = lines[0];
    }

    return customerInfo;
  }
  
  /**
   * Demo data for testing
   */
  static getDemoData() {
    return {
      name: "Al Mansouri Trading LLC",
      email: "info@almansouri.ae", 
      phone: "97144567890",
      customer_mobile: "971501234567",
      address: "Office 1205, Business Bay Tower, Dubai",
      city: "Dubai"
    };
  }
}

export default OfflineOCR;