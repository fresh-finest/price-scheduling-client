import React, { useState } from 'react';

function Account() {
  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const connectAccount = () => {
    // Redirect to the authorization endpoint
    window.location.href = 'https://api.priceobo.com/auth/amazon';
  };

  const fetchAccountData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://api.priceobo.com/api/account');
      if (!response.ok) {
        throw new Error('Failed to fetch account data');
      }
      const data = await response.json();
      setAccountData(data.result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Connect Account with seller central</h1>

      {/* Connect Account Button */}
      <button
        onClick={connectAccount}
        style={{
          padding: '10px 20px',
          marginBottom: '20px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Connect Account
      </button>

      {/* Fetch Account Data Button */}
      <button
        onClick={fetchAccountData}
        style={{
          padding: '10px 20px',
          marginBottom: '20px',
          marginLeft: '10px',
          backgroundColor: '#28a745',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Fetch Account Data
      </button>

      {/* Loading State */}
      {loading && <p>Loading...</p>}

      {/* Error Message */}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {/* Account Data */}
      {accountData && (
        <div>
          <h2>Account Data</h2>
          <pre style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '5px' }}>
            {JSON.stringify(accountData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default Account;
