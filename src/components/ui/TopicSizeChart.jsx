import React from 'react';

const TopicSizeChart = ({ data }) => {
  // Default data if none provided
  const defaultData = [
    { name: 'test', size: 5.1, color: '#3B82F6' },
    { name: 'chatbot-audit-logs', size: 2.4, color: '#10B981' },
    { name: 'payment-support-requests', size: 1.8, color: '#F59E0B' },
    { name: 'user-events', size: 0.95, color: '#8B5CF6' },
  ];

  const chartData = data || defaultData;
  const totalSize = chartData.reduce((sum, item) => sum + item.size, 0);
  
  // Calculate angles for pie slices
  let cumulativeAngle = 0;
  const slices = chartData.map((topic) => {
    const percentage = (topic.size / totalSize) * 100;
    const angle = (topic.size / totalSize) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle += angle;
    
    return {
      ...topic,
      percentage,
      startAngle,
      endAngle,
      angle
    };
  });

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
            <g key={slice.name}>
              <path
                d={createArcPath(centerX, centerY, radius, slice.startAngle, slice.endAngle)}
                fill={slice.color}
                stroke="white"
                strokeWidth="2"
                className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                  animation: `fadeIn 0.8s ease-out ${index * 0.2}s both`
                }}
              />
              {/* Percentage labels on slices */}
              {slice.percentage > 8 && (
                <text
                  x={centerX + (radius * 0.7 * Math.cos((slice.startAngle + slice.endAngle) / 2 * Math.PI / 180 - Math.PI / 2))}
                  y={centerY + (radius * 0.7 * Math.sin((slice.startAngle + slice.endAngle) / 2 * Math.PI / 180 - Math.PI / 2))}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-bold fill-white"
                  style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                >
                  {slice.percentage.toFixed(1)}%
                </text>
              )}
            </g>
          ))}
          
          {/* Center circle for donut effect */}
          <circle
            cx={centerX}
            cy={centerY}
            r="40"
            fill="white"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
          
          {/* Center text */}
          <text
            x={centerX}
            y={centerY - 5}
            textAnchor="middle"
            className="text-sm font-bold fill-gray-700"
          >
            Total
          </text>
          <text
            x={centerX}
            y={centerY + 10}
            textAnchor="middle"
            className="text-lg font-bold fill-gray-900"
          >
            {totalSize.toFixed(1)}GB
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-3">
        <div className="text-sm text-gray-600 mb-4">
          Topic Size Distribution
        </div>
        {slices.map((topic, index) => (
          <div key={topic.name} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ 
                  backgroundColor: topic.color,
                  animation: `scaleIn 0.5s ease-out ${index * 0.1}s both`
                }}
              />
              <span className="text-sm text-gray-700 font-medium truncate max-w-32">
                {topic.name}
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-gray-900">
                {topic.size}GB
              </div>
              <div className="text-xs text-gray-500">
                {topic.percentage.toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default TopicSizeChart;
