import React from 'react';

const ConsumerStatusChart = ({ data }) => {
  // Default data if none provided
  const defaultData = [
    { status: 'Stable', count: 14, percentage: 70, color: '#10B981' },
    { status: 'Rebalancing', count: 5, percentage: 25, color: '#F59E0B' },
    { status: 'Error', count: 1, percentage: 5, color: '#EF4444' },
  ];

  const chartData = data || defaultData;
  const totalGroups = chartData.reduce((sum, item) => sum + item.count, 0);

  // Calculate angles for pie slices
  let cumulativeAngle = 0;
  const slices = chartData.map((item) => {
    const percentage = (item.count / totalGroups) * 100;
    const angle = (item.count / totalGroups) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle += angle;
    
    return {
      ...item,
      percentage,
      startAngle,
      endAngle,
      angle
    };
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Stable': return '🟢';
      case 'Rebalancing': return '🟡';
      case 'Error': return '🔴';
      default: return '⚪';
    }
  };

  // Create SVG path for pie slice
  const createArcPath = (centerX, centerY, radius, startAngle, endAngle) => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", centerX, centerY, 
      "L", start.x, start.y, 
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  };

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const centerX = 120;
  const centerY = 120;
  const radius = 100;

  return (
    <div className="flex items-center space-x-6">
      {/* Pie Chart */}
      <div className="relative">
        <svg width="240" height="240" className="transform rotate-0">
          {slices.map((slice, index) => (
            <g key={slice.status}>
              <path
                d={createArcPath(centerX, centerY, radius, slice.startAngle, slice.endAngle)}
                fill={slice.color}
                stroke="white"
                strokeWidth="3"
                className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                  animation: `growSlice 1s ease-out ${index * 0.3}s both`
                }}
              />
              {/* Percentage labels on slices */}
              {slice.percentage > 10 && (
                <text
                  x={centerX + (radius * 0.7 * Math.cos((slice.startAngle + slice.endAngle) / 2 * Math.PI / 180 - Math.PI / 2))}
                  y={centerY + (radius * 0.7 * Math.sin((slice.startAngle + slice.endAngle) / 2 * Math.PI / 180 - Math.PI / 2))}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-sm font-bold fill-white"
                  style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}
                >
                  {slice.percentage.toFixed(0)}%
                </text>
              )}
            </g>
          ))}
          
          {/* Center circle for donut effect */}
          <circle
            cx={centerX}
            cy={centerY}
            r="45"
            fill="white"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
          
          {/* Center text */}
          <text
            x={centerX}
            y={centerY - 8}
            textAnchor="middle"
            className="text-xs font-medium fill-gray-600"
          >
            Consumer
          </text>
          <text
            x={centerX}
            y={centerY + 5}
            textAnchor="middle"
            className="text-xs font-medium fill-gray-600"
          >
            Groups
          </text>
          <text
            x={centerX}
            y={centerY + 20}
            textAnchor="middle"
            className="text-xl font-bold fill-gray-900"
          >
            {totalGroups}
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-4">
        <div className="text-sm text-gray-600 mb-4">
          Consumer Group Health Status
        </div>
        {slices.map((item, index) => (
          <div key={item.status} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getStatusIcon(item.status)}</span>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ 
                    backgroundColor: item.color,
                    animation: `pulseIn 0.6s ease-out ${index * 0.2}s both`
                  }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {item.status}
              </span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-gray-900">
                {item.count} groups
              </span>
              <div className="text-xs text-gray-500">
                ({item.percentage.toFixed(0)}%)
              </div>
            </div>
          </div>
        ))}
        
        {/* Summary */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Total Groups:</span>
            <span className="font-bold text-gray-900">{totalGroups}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes growSlice {
          from {
            opacity: 0;
            transform: scale(0);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes pulseIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ConsumerStatusChart;
