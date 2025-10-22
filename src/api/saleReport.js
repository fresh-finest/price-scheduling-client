import apiClient from "./index";

export const fetchSaleReport = (id) => apiClient.get(`/api/group/sale-report/${id}`);
export const fetchTotalsale= () => apiClient.get("/total-sales");
// export const fetchSeachProducts =(uid)=>apiClient.get(`/api/favourite/search/${uid}`);
export const fetchSeachProducts =(query)=>apiClient.get(`/api/favourite/find/${query}`);
export const fetchProduct = (page) => apiClient.get("/api/favourite/report/asins",{params:{page,limit:20}});
export const makeFavourite = (sku,isFavourite)=> apiClient.put(`/api/favourite/${sku}`,{isFavourite});


