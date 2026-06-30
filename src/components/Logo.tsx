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
        <path
          d="M19.5 7v10.8a3.2 3.2 0 1 1-1.5-2.7V11l-6 1.3v6.5a3.2 3.2 0 1 1-1.5-2.7V9.8L19.5 7Z"
          fill="white"
        />
      </svg>
      <span className="text-lg font-bold tracking-tight text-white">
        Garagem Beats
      </span>
    </div>
  );
}
