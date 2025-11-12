
import { PARSING_PATTERNS } from '@config/ocrConfig';

/**
 * Simple Text Extraction without complex OCR libraries
 * Uses pattern matching on manually entered text or demo data
 */
class SimpleTextExtractor {

  /**
   * Main function to extract customer details
   * @param {string} imageUri - Image URI (for future OCR implementation)
   * @returns {Promise<Object>} - Customer information
   */
  static async extractCustomerDetails(imageUri = null) {
    try {
      console.log('📋 Using Simple Text Extraction');
      
      // OPTION A: Real OCR (uncomment to enable)
      // if (imageUri) {
      //   const realText = await this.performRealOCR(imageUri);
      //   if (realText) {
      //     return this.parseBusinessCardText(realText);
      //   }
      // }
      
      // OPTION B: Demo data (currently active)
      const demoText = this.getDemoBusinessCardText();
      const customerInfo = this.parseBusinessCardText(demoText);
      
      console.log('✅ Extracted customer info:', customerInfo);
      return customerInfo;
      
    } catch (error) {
      console.error('❌ Text extraction error:', error);
      return this.getDefaultCustomerData();
    }
  }

  /**
   * Parse business card text into structured data
   * @param {string} text - Raw text from business card
   * @returns {Object} - Structured customer data
   */
  static parseBusinessCardText(text) {
    if (!text) return this.getDefaultCustomerData();

    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const customerInfo = {};

    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      
      // Extract company name (lines with business indicators)
      if (!customerInfo.name) {
        const hasBusinessIndicator = PARSING_PATTERNS.BUSINESS_INDICATORS.some(indicator => 
          line.toUpperCase().includes(indicator.toUpperCase())
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

    // Fill in missing fields with demo data
    return {
      ...this.getDefaultCustomerData(),
      ...customerInfo
    };
  }

  /**
   * Simulate different business card texts for testing
   */
  static getDemoBusinessCardText() {
    const demoCards = [
      `Emirates Trading LLC
      Ahmed Al Mansouri
      General Manager
      Tel: +971-4-456-7890
      Mobile: +971-50-123-4567
      Email: ahmed@emiratestrading.ae
      Office 1205, Business Bay Tower
      Dubai, UAE`,
      
      `Al Falah Company Limited
      Sara Al Zahra
      Sales Director  
      Phone: 971-4-567-8901
      Cell: 971-55-234-5678
      sara@alfalah.com
      Building 23, Sheikh Zayed Road
      Abu Dhabi, UAE`,
      
      `Golden Gate Trading
      Mohammed Hassan
      CEO
      Telephone: +971-6-789-0123
      Mobile: +971-52-345-6789
      m.hassan@goldengate.ae
      Office Address: Marina Plaza, Sharjah
      UAE`
    ];
    
    // Return a random demo card
    const randomCard = demoCards[Math.floor(Math.random() * demoCards.length)];
    console.log('📄 Using demo business card:', randomCard);
    return randomCard;
  }

  /**
   * Default customer data template
   */
  static getDefaultCustomerData() {
    return {
      name: "ABC Trading LLC",
      email: "info@abctrading.ae", 
      phone: "97144567890",
      customer_mobile: "971501234567",
      address: "Office 123, Business Tower, Dubai",
      city: "Dubai"
    };
  }

  /**
   * Manual text input for business card details
   * USER CAN TYPE/PASTE BUSINESS CARD TEXT HERE
   * @param {string} manualText - Text entered by user
   * @returns {Object} - Parsed customer info
   */
  static parseManualInput(manualText) {
    console.log('✍️ Parsing manual input:', manualText);
    
    // Example of real business card text:
    // const realCardText = `
    // Al Mansouri Trading LLC
    // Ahmed Al Mansouri - General Manager
    // Tel: +971-4-456-7890
    // Mobile: +971-50-123-4567
    // Email: ahmed@almansouri.ae
    // Office 1205, Business Bay Tower, Dubai
    // `;
    
    return this.parseBusinessCardText(manualText);
  }

  /**
   * Real OCR function (for future implementation)
   * @param {string} imageUri - Image to process
   * @returns {Promise<string>} - Extracted text
   */
  static async performRealOCR(imageUri) {
    try {
      // Add real OCR library here when needed
      // Example with Google ML Kit:
      // import TextRecognition from '@react-native-ml-kit/text-recognition';
      // const result = await TextRecognition.recognize(imageUri);
      // return result.text;
      
      console.log('🔍 Real OCR not implemented yet');
      return null;
    } catch (error) {
      console.error('❌ Real OCR error:', error);
      return null;
    }
  }
}

export default SimpleTextExtractor;