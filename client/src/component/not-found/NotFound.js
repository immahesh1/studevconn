import React from 'react';
import notFound from './error_404.jpg';
export default () => {
  return (
    <div>
      <img
        src={notFound}
        style={{
          width: '100%',
          margin: 'auto',
          backgroundColor: '#660066'
        }}
        alt="Not found"
      />
    </div>
  );
};
