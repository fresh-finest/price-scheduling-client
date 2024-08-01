import axios from 'axios'
const BASE_URL = 'http://localhost:3000';

const fetchProductPrice = async(sku)=>{
    try {
        const response = await axios.get(`${BASE_URL}/product/${sku}/price`);
        return response.data;
    } catch (error) {
        console.error('Error fetching product price: ',error.response?error.response.data: error.message);
        throw error;
    }
}

const updateProductPrice = async(sku,value)=>{
    try {
        const response  = await axios.patch(`${BASE_URL}/product/${sku}/price`,{value});
        return response.data;
    } catch (error) {
        console.log('Error updating product price: ', error.response? error.response.data: error.message );
        throw error;
    }
}

export {fetchProductPrice, updateProductPrice}

