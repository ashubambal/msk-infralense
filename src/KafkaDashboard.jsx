// MSK InfraLens: Kafka UI - Enhanced Implementation
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import TopicSizeChart from "./components/ui/TopicSizeChart";
import ConsumerStatusChart from "./components/ui/ConsumerStatusChart";
import TrafficMonitor from "./components/ui/TrafficMonitor";

export default function KafkaDashboard() {
  const [topics, setTopics] = useState([]);
  const [clusterStatus, setClusterStatus] = useState({});
  const [consumerGroups, setConsumerGroups] = useState([]);
  const [aclCount, setAclCount] = useState(0);
  const [clientConnections, setClientConnections] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const refreshData = async () => {
    setIsRefreshing(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  useEffect(() => {
    // Mock data for demonstration since we don't have a real API
    setTimeout(() => {
      setTopics([
        { name: 'test', partitions: 6, replicationFactor: 3, size: '5.1 GB', throughput: '3.4K msg/s' },
        { name: 'chatbot-audit-logs', partitions: 3, replicationFactor: 2, size: '2.4 GB', throughput: '1.2K msg/s' },
        { name: 'payment-support-requests', partitions: 3, replicationFactor: 2, size: '1.8 GB', throughput: '800 msg/s' },
        { name: 'user-events', partitions: 4, replicationFactor: 2, size: '950 MB', throughput: '500 msg/s' },
        { name: 'order-processing', partitions: 8, replicationFactor: 3, size: '3.2 GB', throughput: '2.1K msg/s' },
        { name: 'notification-queue', partitions: 2, replicationFactor: 2, size: '650 MB', throughput: '300 msg/s' }
      ]);
      setClusterStatus({
        brokers: 3,
        underReplicatedPartitions: 0,
        activeControllers: 1,
        totalPartitions: 26,
        totalMessages: '4.2M',
        avgLatency: '8ms'
      });
      setConsumerGroups([
        { groupId: 'analytics-processor', lag: 45, members: 2, status: 'Stable', topics: ['test', 'user-events'] },
        { groupId: 'audit-service', lag: 12, members: 1, status: 'Stable', topics: ['chatbot-audit-logs'] },
        { groupId: 'payment-handler', lag: 178, members: 3, status: 'Rebalancing', topics: ['payment-support-requests'] },
        { groupId: 'ml-pipeline', lag: 34, members: 4, status: 'Stable', topics: ['test', 'order-processing'] },
        { groupId: 'notification-sender', lag: 89, members: 2, status: 'Stable', topics: ['notification-queue'] },
        { groupId: 'error-handler', lag: 256, members: 1, status: 'Error', topics: ['test'] }
      ]);
      setAclCount(18);
      setClientConnections(12);
    }, 1000);

    // Uncomment these when you have a real API
    // axios.get('/api/topics').then(res => setTopics(res.data));
    // axios.get('/api/cluster-status').then(res => setClusterStatus(res.data));
    // axios.get('/api/consumer-groups').then(res => setConsumerGroups(res.data));
    // axios.get('/api/acls').then(res => setAclCount(res.data.count));
    // axios.get('/api/client-connections').then(res => setClientConnections(res.data.count));
  }, []);

  // Enhanced data for charts
  const topicSizeData = topics.map(topic => ({
    name: topic.name,
    size: parseFloat(topic.size?.replace(/[^\d.]/g, '') || 0),
    color: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4'][topics.indexOf(topic) % 6]
  }));

  const consumerStatusData = [
    { 
      status: 'Stable', 
      count: consumerGroups.filter(g => g.status === 'Stable').length,
      percentage: Math.round((consumerGroups.filter(g => g.status === 'Stable').length / Math.max(consumerGroups.length, 1)) * 100),
      color: '#10B981' 
    },
    { 
      status: 'Rebalancing', 
      count: consumerGroups.filter(g => g.status === 'Rebalancing').length,
      percentage: Math.round((consumerGroups.filter(g => g.status === 'Rebalancing').length / Math.max(consumerGroups.length, 1)) * 100),
      color: '#F59E0B' 
    },
    { 
      status: 'Error', 
      count: consumerGroups.filter(g => g.status === 'Error').length,
      percentage: Math.round((consumerGroups.filter(g => g.status === 'Error').length / Math.max(consumerGroups.length, 1)) * 100),
      color: '#EF4444' 
    }
  ].filter(item => item.count > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">MSK InfraLens</h1>
            <p className="text-gray-600">Apache Kafka Infrastructure Monitoring Dashboard</p>
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
          </div>
        </div>

        {/* Last Updated */}
        <div className="mb-6">
          <Badge variant="outline" className="text-sm">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Badge>
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
                  <TopicSizeChart data={topicSizeData} />
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🔄 Consumer Group Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ConsumerStatusChart data={consumerStatusData} />
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
                <TrafficMonitor />
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
                    <Button className="w-full justify-start" variant="outline">
                      🔄 Restart Brokers
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
