export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width="30"
        height="30"
        viewBox="0 0 30 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="30" height="30" rx="9" fill="#CC1111" />
        <g fill="white">
          <rect x="7" y="11" width="2.8" height="8" rx="1.4" />
          <rect x="11.4" y="7.5" width="2.8" height="15" rx="1.4" />
          <rect x="15.8" y="9.5" width="2.8" height="11" rx="1.4" />
          <rect x="20.2" y="12.5" width="2.8" height="5" rx="1.4" />
        </g>
      </svg>
      <span className="text-lg font-bold tracking-tight text-white">
        Garagem Beats
      </span>
    </div>
  );
}

