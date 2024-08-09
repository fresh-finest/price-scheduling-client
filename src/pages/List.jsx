import React from 'react';
import { Table, Button } from 'react-bootstrap';

const demoData = [
  {
    asin: 'JF2CJRI',
    title: 'BERRY BLUEBERRY',
    currentPrice: '$8.99',
    nextPriceChange: {
      dateRange: 'Oct. 26',
      newPrice: '$8.99',
      direction: 'down',
    },
    image: 'image-url-1',
  },
  {
    asin: 'HE28H7',
    title: 'CHERRY ICE',
    currentPrice: '$7.49',
    nextPriceChange: {
      dateRange: 'Sep. 15',
      newPrice: '$9.99',
      direction: 'up',
    },
    image: 'image-url-2',
  },
  {
    asin: 'GHT234',
    title: 'SOUR APPLE',
    currentPrice: '$3.95',
    nextPriceChange: null,
    image: 'image-url-3',
  },
];

const ListView = () => {
  return (
    <div style={{ padding: '20px', marginTop:'50px' }}>
    <h1>List of product</h1>
      <Table bordered>
        <thead style={{ backgroundColor: '#ff8c00', color: '#fff' }}>
          <tr>
            <th>Image</th>
            <th>ASIN</th>
            <th>Title</th>
            <th>Current Price</th>
            <th>Next Price Change</th>
          </tr>
        </thead>
        <tbody>
          {demoData.map((item, index) => (
            <tr key={index}>
              <td>
                <img src={item.image} alt={item.title} style={{ width: '50px' }} />
              </td>
              <td>{item.asin}</td>
              <td>{item.title}</td>
              <td>{item.currentPrice}</td>
              <td>
                {item.nextPriceChange ? (
                  <div>
                    <span>{item.nextPriceChange.dateRange} - {item.nextPriceChange.newPrice}</span>
                    <br />
                    {item.nextPriceChange.direction === 'up' ? (
                      <span>&#x2191;</span>
                    ) : (
                      <span>&#x2193;</span>
                    )}
                  </div>
                ) : (
                  <span>None</span>
                )}
              </td>
            </tr>
          ))}
          {/* Additional empty rows for design purposes */}
          {[...Array(5)].map((_, i) => (
            <tr key={`empty-${i}`}>
              <td colSpan="5" style={{ height: '50px' }}></td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ListView;
