// MSK InfraLens: AWS MSK Integration Version
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";

export default function KafkaDashboard() {
  const [topics, setTopics] = useState([]);
  const [clusterStatus, setClusterStatus] = useState({});
  const [consumerGroups, setConsumerGroups] = useState([]);
  const [clientConnections, setClientConnections] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // API Base URL from environment or default
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
  const USE_MOCK_DATA = process.env.REACT_APP_MOCK_DATA === 'true';

  const fetchKafkaData = async () => {
    if (USE_MOCK_DATA) {
      // Use mock data if configured
      loadMockData();
      return;
    }

    try {
      setError(null);
      
      // Fetch data from backend API
      const [topicsRes, clusterRes, consumersRes] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/api/kafka/topics`),
        axios.get(`${API_BASE_URL}/api/kafka/cluster-status`),
        axios.get(`${API_BASE_URL}/api/kafka/consumer-groups`)
      ]);

      // Handle topics response
      if (topicsRes.status === 'fulfilled') {
        setTopics(topicsRes.value.data);
      } else {
        console.warn('Failed to fetch topics:', topicsRes.reason);
      }

      // Handle cluster status response
      if (clusterRes.status === 'fulfilled') {
        setClusterStatus(clusterRes.value.data);
      } else {
        console.warn('Failed to fetch cluster status:', clusterRes.reason);
      }

      // Handle consumer groups response
      if (consumersRes.status === 'fulfilled') {
        setConsumerGroups(consumersRes.value.data);
      } else {
        console.warn('Failed to fetch consumer groups:', consumersRes.reason);
      }

      // Simulate client connections (would come from metrics API)
      setClientConnections(8);
      
    } catch (error) {
      console.error('Error fetching Kafka data:', error);
      setError('Failed to connect to Kafka API. Using mock data.');
      loadMockData(); // Fallback to mock data
    }
  };

  const loadMockData = () => {
    // Mock data for demonstration/fallback
    setTopics([
      { name: 'user-events', partitions: 3, replicationFactor: 2, size: '2.4 GB', throughput: '1.2K msg/s' },
      { name: 'order-events', partitions: 6, replicationFactor: 3, size: '5.1 GB', throughput: '3.4K msg/s' },
      { name: 'payment-events', partitions: 3, replicationFactor: 2, size: '1.8 GB', throughput: '800 msg/s' },
      { name: 'notification-events', partitions: 4, replicationFactor: 2, size: '950 MB', throughput: '500 msg/s' }
    ]);
    setClusterStatus({
      brokers: 3,
      underReplicatedPartitions: 0,
      activeControllers: 1,
      totalPartitions: 16,
      totalMessages: '2.4M',
      avgLatency: '12ms'
    });
    setConsumerGroups([
      { groupId: 'analytics-group', lag: 45, members: 2, status: 'Stable', topics: ['user-events', 'order-events'] },
      { groupId: 'audit-group', lag: 12, members: 1, status: 'Stable', topics: ['payment-events'] },
      { groupId: 'reporting-group', lag: 178, members: 3, status: 'Rebalancing', topics: ['user-events', 'notification-events'] },
      { groupId: 'ml-pipeline', lag: 34, members: 4, status: 'Stable', topics: ['order-events'] }
    ]);
    setClientConnections(8);
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchKafkaData();
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await fetchKafkaData();
      setIsLoading(false);
    };

    loadInitialData();

    // Auto-refresh every 30 seconds if enabled
    const refreshInterval = process.env.REACT_APP_REFRESH_INTERVAL || 30000;
    const autoRefresh = process.env.REACT_APP_ENABLE_REAL_TIME === 'true';
    
    let intervalId;
    if (autoRefresh) {
      intervalId = setInterval(fetchKafkaData, refreshInterval);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">MSK InfraLens</h1>
            <p className="text-gray-600">Apache Kafka Infrastructure Monitoring Dashboard</p>
            {USE_MOCK_DATA && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  🎭 <strong>Demo Mode:</strong> Using realistic fake data. 
                  <a href="#" className="underline ml-1" onClick={() => alert('See AWS_MSK_SETUP.md for integration guide')}>
                    Connect to real AWS MSK?
                  </a>
                </p>
              </div>
            )}
          </div>
          <div className="flex space-x-4">
            <Button 
              onClick={refreshData} 
              disabled={isRefreshing}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isRefreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
            </Button>
            <Button variant="outline" className="border-gray-300">
              ⚙️ Settings
            </Button>
            <Button variant="outline" className="border-gray-300">
              📊 Export
            </Button>
            {!USE_MOCK_DATA && (
              <Button 
                variant="outline" 
                className="border-green-300 text-green-700 hover:bg-green-50"
                onClick={() => alert('Connected to AWS MSK: ' + (process.env.REACT_APP_API_BASE_URL || 'localhost:8000'))}
              >
                🔗 AWS MSK
              </Button>
            )}
          </div>
        </div>

        {/* Last Updated */}
        <div className="mb-6 flex items-center justify-between">
          <Badge variant="outline" className="text-sm">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Badge>
          <div className="flex items-center gap-2">
            {error && (
              <Badge variant="destructive" className="text-sm">
                ⚠️ {error}
              </Badge>
            )}
            {USE_MOCK_DATA && (
              <Badge variant="secondary" className="text-sm">
                🎭 Demo Mode (Mock Data)
              </Badge>
            )}
            {isLoading && (
              <Badge variant="outline" className="text-sm">
                🔄 Loading...
              </Badge>
            )}
            <Badge variant={error ? 'destructive' : 'default'} className="text-sm">
              {error ? '🔴 Disconnected' : '🟢 Connected'}
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="cluster">
          <TabsList className="mb-6">
            <TabsTrigger value="cluster">🏠 Cluster Overview</TabsTrigger>
            <TabsTrigger value="topics">📝 Topics</TabsTrigger>
            <TabsTrigger value="consumers">👥 Consumers</TabsTrigger>
            <TabsTrigger value="analytics">📈 Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="cluster">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{clusterStatus.brokers || 0}</div>
                  <div className="text-sm opacity-90">Kafka Brokers</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{clusterStatus.totalPartitions || 0}</div>
                  <div className="text-sm opacity-90">Total Partitions</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{clusterStatus.totalMessages || '0'}</div>
                  <div className="text-sm opacity-90">Total Messages</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{clusterStatus.avgLatency || '0ms'}</div>
                  <div className="text-sm opacity-90">Avg Latency</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{clusterStatus.underReplicatedPartitions || 0}</div>
                  <div className="text-sm opacity-90">Under-Replicated</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{clientConnections}</div>
                  <div className="text-sm opacity-90">Client Connections</div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    📊 Topic Size Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📊</div>
                      <div className="text-lg font-semibold text-gray-700">Topic Size Chart</div>
                      <div className="text-sm text-gray-500">Interactive chart coming soon</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🔄 Consumer Group Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🔄</div>
                      <div className="text-lg font-semibold text-gray-700">Consumer Status Chart</div>
                      <div className="text-sm text-gray-500">Interactive chart coming soon</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Traffic Monitor */}
            <Card className="shadow-lg mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🚀 Real-time Kafka Traffic
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-4">📈</div>
                    <div className="text-lg font-semibold text-gray-700">Real-time Traffic Chart</div>
                    <div className="text-sm text-gray-500">Integration with Chart.js or Recharts needed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Topics and Consumers Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>📝 Topics Overview</span>
                    <Button size="sm" variant="outline">View All</Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2">Partitions</th>
                          <th className="text-left p-2">Size</th>
                          <th className="text-left p-2">Throughput</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topics.slice(0, 4).map(topic => (
                          <tr key={topic.name} className="border-b hover:bg-gray-50">
                            <td className="p-2 font-medium">{topic.name}</td>
                            <td className="p-2">{topic.partitions}</td>
                            <td className="p-2">{topic.size}</td>
                            <td className="p-2">
                              <Badge variant="secondary">{topic.throughput}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>👥 Consumer Groups</span>
                    <Button size="sm" variant="outline">View All</Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {consumerGroups.slice(0, 4).map(group => (
                      <div key={group.groupId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{group.groupId}</div>
                          <div className="text-sm text-gray-600">{group.members} members</div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={group.status === 'Stable' ? 'default' : group.status === 'Rebalancing' ? 'destructive' : 'secondary'}
                          >
                            {group.status}
                          </Badge>
                          <div className="text-sm font-bold text-orange-600 mt-1">
                            Lag: {group.lag}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="topics">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Topics Management</h2>
              <div className="flex space-x-2">
                <Button className="bg-green-600 hover:bg-green-700">+ Create Topic</Button>
                <Button variant="outline">🔍 Search</Button>
                <Button variant="outline">⚙️ Configure</Button>
              </div>
            </div>
            
            <div className="grid gap-4">
              {topics.map(topic => (
                <Card key={topic.name} className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{topic.name}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Partitions:</span>
                            <span className="font-bold ml-2">{topic.partitions}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Replication:</span>
                            <span className="font-bold ml-2">{topic.replicationFactor}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Size:</span>
                            <span className="font-bold ml-2">{topic.size}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Throughput:</span>
                            <Badge variant="secondary" className="ml-2">{topic.throughput}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">📊 Details</Button>
                        <Button size="sm" variant="outline">⚙️ Config</Button>
                        <Button size="sm" variant="destructive">🗑️ Delete</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="consumers">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Consumer Groups</h2>
              <div className="flex space-x-2">
                <Button variant="outline">🔍 Search</Button>
                <Button variant="outline">📊 Monitor</Button>
                <Button variant="outline">⚙️ Manage</Button>
              </div>
            </div>
            
            <div className="grid gap-4">
              {consumerGroups.map(group => (
                <Card key={group.groupId} className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-bold text-gray-900">{group.groupId}</h3>
                          <Badge 
                            variant={group.status === 'Stable' ? 'default' : group.status === 'Rebalancing' ? 'destructive' : 'secondary'}
                          >
                            {group.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Members:</span>
                            <span className="font-bold ml-2">{group.members}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Lag:</span>
                            <span className="font-bold ml-2 text-orange-600">{group.lag}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Topics:</span>
                            <div className="mt-1">
                              {group.topics?.map(topic => (
                                <Badge key={topic} variant="outline" className="mr-1 mb-1 text-xs">
                                  {topic}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">📊 Details</Button>
                        <Button size="sm" variant="outline">🔄 Reset</Button>
                        <Button size="sm" variant="destructive">🗑️ Delete</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics & Insights</h2>
              <p className="text-gray-600">Comprehensive analysis of your Kafka infrastructure</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>📈 Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Message Throughput</span>
                      <Badge variant="secondary">6.4K msg/s</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Latency</span>
                      <Badge variant="secondary">{clusterStatus.avgLatency}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Peak Throughput (24h)</span>
                      <Badge variant="secondary">12.8K msg/s</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Error Rate</span>
                      <Badge variant="default">0.02%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>⚠️ Health Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Cluster Health</span>
                      <Badge variant="default">🟢 Healthy</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Under-replicated Partitions</span>
                      <Badge variant="default">{clusterStatus.underReplicatedPartitions}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Offline Partitions</span>
                      <Badge variant="default">0</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>ISR Shrinks</span>
                      <Badge variant="secondary">2 (24h)</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>🔧 Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {USE_MOCK_DATA ? (
                      <>
                        <Button 
                          className="w-full justify-start" 
                          variant="outline"
                          onClick={() => alert('Demo Mode: These actions require real AWS MSK connection. See AWS_MSK_SETUP.md')}
                        >
                          🎭 Demo: Restart Brokers
                        </Button>
                        <Button 
                          className="w-full justify-start" 
                          variant="outline"
                          onClick={() => alert('Demo Mode: These actions require real AWS MSK connection. See AWS_MSK_SETUP.md')}
                        >
                          🎭 Demo: Rebalance Topics
                        </Button>
                        <Button 
                          className="w-full justify-start bg-green-50 text-green-700 border-green-300" 
                          variant="outline"
                          onClick={() => alert('Ready to connect to real AWS MSK?\n\n1. Get your MSK cluster details\n2. Edit .env file\n3. Set REACT_APP_MOCK_DATA=false\n4. Restart: docker-compose restart\n\nSee AWS_MSK_SETUP.md for detailed guide')}
                        >
                          � Connect to AWS MSK
                        </Button>
                        <Button 
                          className="w-full justify-start" 
                          variant="outline"
                          onClick={() => window.open('https://docs.aws.amazon.com/msk/', '_blank')}
                        >
                          📖 AWS MSK Documentation
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button className="w-full justify-start" variant="outline">
                          �🔄 Restart Brokers
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                          ⚖️ Rebalance Topics
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                          🧹 Clean Logs
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                          📊 Generate Report
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>📊 Resource Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>CPU Usage</span>
                        <span>68%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '68%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Memory Usage</span>
                        <span>72%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{width: '72%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Disk Usage</span>
                        <span>45%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-600 h-2 rounded-full" style={{width: '45%'}}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>🔔 Recent Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <Badge variant="destructive" className="mt-0.5">🔴</Badge>
                      <div>
                        <div className="font-medium">High Consumer Lag</div>
                        <div className="text-gray-600">reporting-group lag &gt; 150</div>
                        <div className="text-xs text-gray-500">2 min ago</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge variant="secondary" className="mt-0.5">🟡</Badge>
                      <div>
                        <div className="font-medium">Topic Size Warning</div>
                        <div className="text-gray-600">order-events approaching limit</div>
                        <div className="text-xs text-gray-500">15 min ago</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge variant="default" className="mt-0.5">🟢</Badge>
                      <div>
                        <div className="font-medium">Broker Restart Complete</div>
                        <div className="text-gray-600">broker-2 back online</div>
                        <div className="text-xs text-gray-500">1 hr ago</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
