import React, {SVGProps} from 'react';

type RocicorpLogoProps = {
  className?: string;
} & SVGProps<SVGSVGElement>;

function RocicorpLogo(props: RocicorpLogoProps) {
  return (
    <svg
      width="149"
      height="149"
      viewBox="0 0 149 149"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 148.367H148.367L111.515 111.515C133.078 103.157 148.367 82.213 148.367 57.6982C148.367 25.8324 122.534 0 90.6685 0H0V115.396V148.367Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default RocicorpLogo;
