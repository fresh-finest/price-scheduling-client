import axios from 'axios';
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const BASE_URL = 'http://localhost:3000';

function UpdateSalePrice() {
  const [sku, setSku] = useState('');
  const [value, setValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sku || !value || !startDate || !endDate) {
      setMessage('All fields are required.');
      return;
    }

    const payload = {
      sku,
      value: parseFloat(value),
      startDate,
      endDate,
    };

    try {
      const response = await axios.patch(`${BASE_URL}/sale-price`, payload, { headers: { "Content-Type": "application/json" } });
      setMessage(`Success: ${response.data.message || 'Sale price updated!'}`);
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.message || 'Something went wrong.'}`);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow">
        <div className="card-body">
          <h1 className="card-title text-center">Update Sale Price</h1>
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="mb-3">
              <label htmlFor="sku" className="form-label">
                SKU:
              </label>
              <input
                type="text"
                id="sku"
                className="form-control"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="price" className="form-label">
                Price:
              </label>
              <input
                type="number"
                id="price"
                className="form-control"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="startDate" className="form-label">
                Start Date:
              </label>
              <input
                type="date"
                id="startDate"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="endDate" className="form-label">
                End Date:
              </label>
              <input
                type="date"
                id="endDate"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn  btn-primary w-50">
              Update Price
            </button>
          </form>
          {message && (
            <div className={`alert mt-4 ${message.startsWith('Success') ? 'alert-success' : 'alert-danger'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UpdateSalePrice;
