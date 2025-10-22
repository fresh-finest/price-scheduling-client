import apiClient from "./index";

export const fetchProduct = () => apiClient.get("/api/group");

export const createProduct = (productData)=>apiClient.post("/api/group",productData);

export const fetchProductBySku = (sku) =>apiClient.get(`/api/group/sku/${sku}`)

export const fetchSingleProduct = (id)=>apiClient.get(`/api/group/${id}`)

export const updateSingleProduct = (id,data)=>apiClient.put(`/api/group/${id}`,data)

export const deleteProduct = (id)=>apiClient.delete(`/api/group/${id}`);

export const addSku = (id,skus)=>apiClient.put(`/api/group/${id}`,{skus})

export const updateSku = (id,data) => apiClient.put(`/api/group/${id}/sku`,data)

export const bulkmapSku = (data)=>apiClient.put(`api/group`,data)

export const fetchGroupSaleReport = (id) => apiClient.get(`/api/group/sale-report/${id}`)

export const searchProduct = (query)=>apiClient.get(`/api/group/search?uid=${query}`)