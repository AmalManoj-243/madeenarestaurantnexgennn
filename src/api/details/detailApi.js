import { get } from "../services/utils";
import handleApiError from "@api/utils/handleApiError";
import { API_ENDPOINTS, DETAIL_API_ENDPOINTS } from "@api/endpoints";

const { GET_PRODUCT_DETAILS, GET_INVENTORY_DETAILS } = DETAIL_API_ENDPOINTS;

const fetchDetails = async (endpoint, detailId) => {
  try {
    const response = await get(`${endpoint}/${detailId}`)
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

const fetchBarcodeDetails = async (endpoint, code) => {
  try {
    const response = await get(`${endpoint}?barcode=${code}`)
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export const fetchProductDetails = async (detailId) => {
  return fetchDetails(GET_PRODUCT_DETAILS, detailId);
};

export const fetchProductDetailsByBarcode = async (code) => {
  return fetchBarcodeDetails(GET_PRODUCT_DETAILS, code);
};

export const fetchCustomerDetails = async (detailId) => {
  return fetchDetails(API_ENDPOINTS.VIEW_CUSTOMERS, detailId);
};

const fetchDetailBySearch = async (endpoint, search, warehouseId) => {
  try {
    const response = await get(`${endpoint}?name=${search}&warehouse_id=${warehouseId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export const fetchInventoryDetailsByName = async (name, warehouseId) => {
  return fetchDetailBySearch(GET_INVENTORY_DETAILS, name, warehouseId);
};
