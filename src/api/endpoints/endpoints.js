//src/api/services/endpoints.js

export const API_ENDPOINTS = {
    VIEW_PRODUCTS: '/viewProducts',
    VIEW_CATEGORIES: '/viewCategories',
    VIEW_WAREHOUSE: `/viewWarehouses`,
    VIEW_CUSTOMERS: '/viewCustomers',
    VIEW_QUOTATION: '/viewQuotation',
};

export const DROP_DOWN_API_ENDPOINTS = {
    INVOICE: '/viewInvoice/invoice/invoice_dropdown',
    EMPLOYEE_DROPDOWN: '/viewEmployees/employee_list/employee_dropdown',
    CUSTOMER_DROPDOWN: '/viewCustomers/customer_list/drop_down',
    COUNTRY: "/viewCountry/country_list/country_dropdown",
    STATE: "/viewState",
    AREA: "/viewArea/area_list/drop_down",
    SALESPERSON: "/viewEmployees/employee_list/employee_dropdown",
    COLLECTIONAGENT: "/viewEmployees/employee_list/employee_dropdown",
    LANGUAGE: "/viewLanguage/language_list/language_dropdown",
    CURRENCY: "/viewCurrency/currency_list/currency_dropdown",
    PRODUCTS: "/viewProducts/product_list/product_dropdown",
    UOM: "/viewUnitOfMeasure",
    CUSTOMER_NAME: "/viewCustomers/customer_list/drop_down",
    WAREHOUSE: "/viewWarehouses/warehouse_list/warehouse_dropdown",
    UNIT_OF_MEASURE: "/viewUnitOfMeasure/quality_list/quality_dropdown",
    TAXES: "/viewTaxType/tax_type_list/tax_type_dropdown",
    PAYMENT_MODE: "/viewPaymentMethod/payment_method_list/payment_method_dropdown",
    BANK_CHEQUE: "/viewChequeBank/cheq_bank_list/cheq_bank_dropdown",
};

export const DETAIL_API_ENDPOINTS = {
    GET_PRODUCT_DETAILS: '/viewProducts',
    GET_INVENTORY_DETAILS: 'https://317099813597.ngrok-free.app/api/viewInventory',
};
