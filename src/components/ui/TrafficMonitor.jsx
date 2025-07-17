import React, { useState, useEffect } from 'react';

const TrafficMonitor = ({ data }) => {
  const [animationStep, setAnimationStep] = useState(0);
  const [hoveredBar, setHoveredBar] = useState(null);

  // Generate default real-time traffic data (20 data points for last 10 minutes)
  const generateTrafficData = () => {
    const now = new Date();
    const dataPoints = [];
    
    for (let i = 19; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - (i * 30000)); // 30-second intervals
      const baseTraffic = 1000 + Math.sin(i * 0.3) * 500; // Sine wave pattern
      const randomVariation = Math.random() * 400 - 200; // Random variation
      const traffic = Math.max(0, Math.floor(baseTraffic + randomVariation));
      
      dataPoints.push({
        timestamp,
        messages: traffic,
        label: i === 0 ? 'now' : `-${Math.floor(i/2)}m`
      });
    }
    
    return dataPoints;
  };

  const [trafficData, setTrafficData] = useState(generateTrafficData);

  // Update data every 5 seconds to simulate real-time
  useEffect(() => {
    const interval = setInterval(() => {
      setTrafficData(generateTrafficData());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationStep(1);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const maxMessages = Math.max(...trafficData.map(d => d.messages));

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="text-sm text-gray-600">Real-time Kafka Traffic</div>
          <div className="text-xs text-gray-500">Messages per second over time</div>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <div className="w-3 h-3 bg-gradient-to-t from-blue-600 to-blue-400 rounded"></div>
          <span>Message Throughput</span>
        </div>
      </div>

      {/* Traffic Chart Container */}
      <div className="relative h-48 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border border-gray-200">
        {/* Y-axis labels */}
        <div className="absolute left-2 top-2 bottom-8 flex flex-col justify-between text-xs text-gray-400 w-8">
          <span>{Math.round(maxMessages)}</span>
          <span>{Math.round(maxMessages * 0.75)}</span>
          <span>{Math.round(maxMessages * 0.5)}</span>
          <span>{Math.round(maxMessages * 0.25)}</span>
          <span>0</span>
        </div>

        {/* Chart Area */}
        <div className="absolute left-12 right-4 top-4 bottom-8">
          <div className="flex items-end justify-between h-full">
            {trafficData.map((point, index) => {
              const height = (point.messages / maxMessages) * 100;
              const isLast3 = index >= trafficData.length - 3;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center h-full max-w-4">
                  {/* Bar Container */}
                  <div className="flex-1 flex items-end w-full px-0.5">
                    <div
                      className="w-full relative cursor-pointer transition-all duration-300 ease-out rounded-t-sm"
                      style={{
                        height: animationStep ? `${height}%` : '0%',
                        background: isLast3 
                          ? 'linear-gradient(to top, #1E40AF, #3B82F6, #60A5FA)'
                          : 'linear-gradient(to top, #1E40AF, #3B82F6)',
                        minHeight: '2px',
                        transition: 'height 1s ease-out, background 0.3s ease',
                        transitionDelay: `${index * 50}ms`,
                        opacity: hoveredBar === index ? 0.8 : 1,
                        transform: hoveredBar === index ? 'scaleY(1.05)' : 'scaleY(1)',
                      }}
                      onMouseEnter={() => setHoveredBar(index)}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      {/* Hover tooltip */}
                      {hoveredBar === index && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-20">
                          <div className="bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                            <div>{point.messages} msg/s</div>
                            <div className="text-xs opacity-75">
                              {point.label === 'now' ? 'now' : point.label}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Animated shimmer effect for recent bars */}
                      {isLast3 && (
                        <div 
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                          style={{
                            animation: 'shimmer 2s ease-in-out infinite',
                            animationDelay: `${index * 0.3}s`
                          }}
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* Time labels - show every 4th label to avoid crowding */}
                  {index % 4 === 0 && (
                    <div className="text-xs text-gray-500 mt-1 whitespace-nowrap">
                      {point.label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* X-axis line */}
        <div className="absolute left-12 right-4 bottom-8 h-px bg-gray-300"></div>
      </div>

      {/* Current stats */}
      <div className="grid grid-cols-3 gap-4 text-center mt-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-lg font-bold text-blue-600">
            {trafficData[trafficData.length - 1]?.messages || 0}
          </div>
          <div className="text-xs text-gray-600">Current msg/s</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-lg font-bold text-green-600">
            {Math.round(trafficData.reduce((sum, d) => sum + d.messages, 0) / trafficData.length)}
          </div>
          <div className="text-xs text-gray-600">Avg msg/s</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="text-lg font-bold text-purple-600">
            {Math.max(...trafficData.map(d => d.messages))}
          </div>
          <div className="text-xs text-gray-600">Peak msg/s</div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default TrafficMonitor;
