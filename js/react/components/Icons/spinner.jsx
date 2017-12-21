import React from 'react';

const Spinner = () => (
    <svg
      width="70px"
      height="70px"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid"
      className="uil-ring-alt absolute z-9999"

    >
        <rect x="0" y="0" width="100" height="100" fill="none" className="bk" />
        <circle cx="50" cy="50" r="40" stroke="#afafb7" fill="none" strokeWidth="10" strokeLinecap="round" />
        <circle cx="50" cy="50" r="40" stroke="#fe5459" fill="none" strokeWidth="6" strokeLinecap="round">
            <animate
              attributeName="stroke-dashoffset"
              dur="3s" repeatCount="indefinite"
              from="0"
              to="502"
            />
            <animate
              attributeName="stroke-dasharray"
              dur="3s"
              repeatCount="indefinite"
              values="150.6 100.4;1 250;150.6 100.4"
            />
        </circle>
    </svg>
);

export default Spinner;
