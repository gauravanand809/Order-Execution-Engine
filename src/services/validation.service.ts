export class ValidationService {
  /**
   * Validates the order request
   */
  static validateOrderRequest(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data) {
      errors.push("Request body is required");
      return { isValid: false, errors };
    }
    
    if (typeof data.amount !== 'number' || data.amount <= 0) {
      errors.push("Amount must be a positive number");
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validates quote request parameters
   */
  static validateQuoteRequest(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data) {
      errors.push("Quote request data is required");
      return { isValid: false, errors };
    }
    
    if (!data.inputToken || typeof data.inputToken !== 'string') {
      errors.push("Input token is required and must be a string");
    }
    
    if (!data.outputToken || typeof data.outputToken !== 'string') {
      errors.push("Output token is required and must be a string");
    }
    
    if (typeof data.amountIn !== 'number' || data.amountIn <= 0) {
      errors.push("Amount in must be a positive number");
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}