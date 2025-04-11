const LineChartLoadingSkeleton = () => {
    return (
      <div className="w-full h-[300px] rounded-md p-4 animate-pulse">
        {/* Grid Lines */}
        <div className="flex flex-col justify-between h-full relative">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-full h-[1px] bg-gray-200" />
          ))}
  
          {/* Simulated Lines */}
          <svg className="absolute inset-0 w-full h-full overflow-visible">
            <path
              d="M 0 100 C 40 80, 80 120, 120 90 S 200 110, 250 80 S 300 130, 350 100 S 400 90, 500 100"
              stroke="#CBD5E1"
              strokeWidth="3"
              fill="none"
              className="animate-pulse"
            />
            <path
              d="M 0 150 C 40 130, 80 160, 120 130 S 200 140, 250 110 S 300 150, 350 120 S 400 130, 500 140"
              stroke="#E2E8F0"
              strokeWidth="3"
              fill="none"
              className="animate-pulse"
            />
          </svg>
        </div>
      </div>
    );
  };
  
  export default LineChartLoadingSkeleton;
  