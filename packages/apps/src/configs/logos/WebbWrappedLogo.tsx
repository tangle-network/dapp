import * as React from 'react';

function WebbWrappedLogo(element: JSX.Element) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 4,
          color: 'blue',
        }}
      >
        🕸
      </div>
      {element}
    </div>
  );
}

export default WebbWrappedLogo;
