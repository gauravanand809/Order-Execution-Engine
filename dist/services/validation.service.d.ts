export declare class ValidationService {
    /**
     * Validates the order request
     */
    static validateOrderRequest(data: any): {
        isValid: boolean;
        errors: string[];
    };
    /**
     * Validates quote request parameters
     */
    static validateQuoteRequest(data: any): {
        isValid: boolean;
        errors: string[];
    };
}
//# sourceMappingURL=validation.service.d.ts.map