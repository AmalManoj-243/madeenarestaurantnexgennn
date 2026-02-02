import { DROP_DOWN_API_ENDPOINTS } from "@api/endpoints";
import { get } from "@api/services/utils";
import handleApiError from "@api/utils/handleApiError";
import { fetchProductsOdoo } from "@api/services/generalApi";

const fetchData = async (endpoint) => {
  try {
    const response = await get(endpoint);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const fetchEmployeesDropdown = async () => {
  return fetchData(DROP_DOWN_API_ENDPOINTS.EMPLOYEE_DROPDOWN);
};

export const fetchCustomersDropdown = async () => {
  return fetchData(DROP_DOWN_API_ENDPOINTS.CUSTOMER_DROPDOWN);
};

export const fetchCountryDropdown = async () => {
  return fetchData(DROP_DOWN_API_ENDPOINTS.COUNTRY);
}

export const fetchStateDropdown = async (countryId) => {
  return fetchData(`${DROP_DOWN_API_ENDPOINTS.STATE}?country_id=${countryId}`);
}

export const fetchAreaDropdown = async (stateId) => {
  return fetchData(`${DROP_DOWN_API_ENDPOINTS.AREA}?state_id=${stateId}`);
};

export const fetchSalesPersonDropdown = async () => {
  return fetchData(DROP_DOWN_API_ENDPOINTS.SALESPERSON);
}

export const fetchCollectionAgentDropdown = async () => {
  return fetchData(DROP_DOWN_API_ENDPOINTS.COLLECTIONAGENT);
}

export const fetchAssigneeDropdown = async () => {
  return fetchData(DROP_DOWN_API_ENDPOINTS.EMPLOYEE_DROPDOWN);
}

export const fetchLanguageDropdown = async () => {
  return fetchData(DROP_DOWN_API_ENDPOINTS.LANGUAGE);
}

export const fetchCurrencyDropdown = async () => {
  return fetchData(DROP_DOWN_API_ENDPOINTS.CURRENCY);
}

export const fetchProductsDropdown = async (searchText = '') => {
  try {
    const products = await fetchProductsOdoo({ offset: 0, limit: 50, searchText });
    return products.map(p => ({
      _id: p.id,
      product_name: p.product_name || p.name || '',
      product_description: p.product_description || '',
      cost: p.price || 0,
      image_url: p.image_url || null,
      categ_id: p.categ_id || null,
    }));
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export const fetchUomDropdown = async () => {
  return fetchData(DROP_DOWN_API_ENDPOINTS.UOM);
}

export const fetchCustomerNameDropdown = async () => {
  return fetchData(DROP_DOWN_API_ENDPOINTS.CUSTOMER_NAME);
}

export const fetchWarehouseDropdown = async () => {
  return fetchData(DROP_DOWN_API_ENDPOINTS.WAREHOUSE);
}

export const fetchUnitOfMeasureDropdown = async () => {
  return fetchData(DROP_DOWN_API_ENDPOINTS.UNIT_OF_MEASURE);
}

export const fetchTaxDropdown = async () => {
  return fetchData(DROP_DOWN_API_ENDPOINTS.TAXES);
}

export const fetchPaymentModeDropdown = async () => {
  return fetchData(DROP_DOWN_API_ENDPOINTS.PAYMENT_MODE);
}

export const fetchBankChequeDropdown = async () => {
  return fetchData(DROP_DOWN_API_ENDPOINTS.BANK_CHEQUE);
}
