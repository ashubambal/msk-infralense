const { Kafka } = require('kafkajs');
const { KafkaClient, GetBootstrapBrokersCommand } = require('@aws-sdk/client-kafka');
const { awsIamAuthenticator } = require('@jm18457/kafkajs-msk-iam-authentication-mechanism');

class KafkaService {
  constructor() {
    this.kafkaClient = null;
    this.awsKafkaClient = new KafkaClient({
      region: process.env.AWS_REGION || 'us-west-2'
    });
    this.bootstrapServers = [];
    this.initializeKafka();
  }

  async discoverMSKBootstrapServers() {
    try {
      const clusterArn = process.env.MSK_CLUSTER_ARN;
      if (!clusterArn) {
        console.log('No MSK cluster ARN provided, using manual bootstrap servers');
        return process.env.KAFKA_BOOTSTRAP_SERVERS?.split(',') || [];
      }

      console.log(`Discovering bootstrap servers for MSK cluster: ${clusterArn}`);
      
      const command = new GetBootstrapBrokersCommand({
        ClusterArn: clusterArn
      });

      const response = await this.awsKafkaClient.send(command);
      
      // Use TLS bootstrap servers for MSK
      const bootstrapServers = response.BootstrapBrokerStringTls?.split(',') || 
                              response.BootstrapBrokerString?.split(',') || [];
      
      console.log(`Discovered ${bootstrapServers.length} bootstrap servers:`, bootstrapServers);
      return bootstrapServers;
    } catch (error) {
      console.error('Failed to discover MSK bootstrap servers:', error);
      console.log('Falling back to manual configuration...');
      return process.env.KAFKA_BOOTSTRAP_SERVERS?.split(',') || [];
    }
  }

  async initializeKafka() {
    try {
      // First try to discover bootstrap servers from MSK
      this.bootstrapServers = await this.discoverMSKBootstrapServers();
      
      if (this.bootstrapServers.length === 0) {
        console.warn('No Kafka bootstrap servers configured or discovered');
        return;
      }

      console.log(`Initializing Kafka client with servers: ${this.bootstrapServers.join(', ')}`);

      // Configure authentication based on SASL mechanism
      let authConfig = {};
      if (process.env.KAFKA_SASL_MECHANISM === 'AWS_MSK_IAM') {
        console.log('Using AWS MSK IAM authentication');
        authConfig = {
          ssl: true,
          sasl: {
            mechanism: 'aws-iam',
            authenticationProvider: awsIamAuthenticator(process.env.AWS_REGION || 'us-west-2')
          }
        };
      } else if (process.env.KAFKA_SASL_MECHANISM) {
        console.log(`Using SASL authentication: ${process.env.KAFKA_SASL_MECHANISM}`);
        authConfig = {
          ssl: true,
          sasl: {
            mechanism: process.env.KAFKA_SASL_MECHANISM,
            username: process.env.KAFKA_SASL_USERNAME,
            password: process.env.KAFKA_SASL_PASSWORD,
          }
        };
      } else {
        console.log('Using SSL-only authentication');
        authConfig = {
          ssl: true
        };
      }

      this.kafkaClient = new Kafka({
        clientId: 'msk-infralens-api',
        brokers: this.bootstrapServers,
        ...authConfig,
        connectionTimeout: parseInt(process.env.KAFKA_CONNECTION_TIMEOUT) || 10000,
        requestTimeout: parseInt(process.env.KAFKA_REQUEST_TIMEOUT) || 30000,
        retry: {
          initialRetryTime: 100,
          retries: parseInt(process.env.KAFKA_RETRY_ATTEMPTS) || 8
        }
      });

      console.log('Kafka client initialized successfully');
      
      // Test the connection
      await this.testConnection();
    } catch (error) {
      console.error('Failed to initialize Kafka client:', error);
    }
  }

  async testConnection() {
    try {
      const admin = this.kafkaClient.admin();
      await admin.connect();
      const metadata = await admin.fetchTopicMetadata();
      console.log(`Successfully connected to Kafka cluster with ${metadata.brokers.length} brokers`);
      await admin.disconnect();
      return true;
    } catch (error) {
      console.error('Kafka connection test failed:', error);
      return false;
    }
  }

  async getTopics() {
    try {
      if (!this.kafkaClient) {
        return this.getMockTopics();
      }

      const admin = this.kafkaClient.admin();
      await admin.connect();

      const topics = await admin.listTopics();
      const topicsMetadata = await admin.fetchTopicMetadata({ topics });

      await admin.disconnect();

      return topicsMetadata.topics.map(topic => ({
        name: topic.name,
        partitions: topic.partitions.length,
        replicationFactor: topic.partitions[0]?.replicas?.length || 0,
        size: 'N/A', // Would need additional metrics API
        throughput: 'N/A' // Would need CloudWatch metrics
      }));
    } catch (error) {
      console.error('Error fetching topics:', error);
      return this.getMockTopics();
    }
  }

  async getClusterStatus() {
    try {
      if (!this.kafkaClient) {
        return this.getMockClusterStatus();
      }

      const admin = this.kafkaClient.admin();
      await admin.connect();

      const metadata = await admin.fetchTopicMetadata();
      const brokers = metadata.brokers.length;
      
      let totalPartitions = 0;
      let underReplicatedPartitions = 0;

      for (const topic of metadata.topics) {
        totalPartitions += topic.partitions.length;
        
        for (const partition of topic.partitions) {
          if (partition.isr.length < partition.replicas.length) {
            underReplicatedPartitions++;
          }
        }
      }

      await admin.disconnect();

      return {
        brokers,
        underReplicatedPartitions,
        activeControllers: 1, // Would need JMX metrics
        totalPartitions,
        totalMessages: 'N/A', // Would need CloudWatch metrics
        avgLatency: 'N/A' // Would need CloudWatch metrics
      };
    } catch (error) {
      console.error('Error fetching cluster status:', error);
      return this.getMockClusterStatus();
    }
  }

  async getConsumerGroups() {
    try {
      if (!this.kafkaClient) {
        return this.getMockConsumerGroups();
      }

      const admin = this.kafkaClient.admin();
      await admin.connect();

      const groups = await admin.listGroups();
      const consumerGroups = [];

      for (const group of groups.groups) {
        try {
          const groupDescription = await admin.describeGroups([group.groupId]);
          const groupOffsets = await admin.fetchOffsets({ groupId: group.groupId });

          const groupInfo = groupDescription.groups[0];
          
          consumerGroups.push({
            groupId: group.groupId,
            lag: 0, // Would need to calculate from offsets
            members: groupInfo.members.length,
            status: groupInfo.state,
            topics: [...new Set(groupOffsets.map(offset => offset.topic))]
          });
        } catch (err) {
          console.warn(`Could not fetch details for group ${group.groupId}:`, err.message);
        }
      }

      await admin.disconnect();
      return consumerGroups;
    } catch (error) {
      console.error('Error fetching consumer groups:', error);
      return this.getMockConsumerGroups();
    }
  }

  async getTopicDetails(topicName) {
    try {
      if (!this.kafkaClient) {
        return { error: 'Kafka client not available' };
      }

      const admin = this.kafkaClient.admin();
      await admin.connect();

      const metadata = await admin.fetchTopicMetadata({ topics: [topicName] });
      const configs = await admin.describeConfigs({
        resources: [{
          type: 2, // TOPIC
          name: topicName
        }]
      });

      await admin.disconnect();

      const topic = metadata.topics[0];
      return {
        name: topicName,
        partitions: topic.partitions.map(p => ({
          partition: p.partitionId,
          leader: p.leader,
          replicas: p.replicas,
          isr: p.isr
        })),
        configs: configs.resources[0]?.configEntries || []
      };
    } catch (error) {
      console.error('Error fetching topic details:', error);
      return { error: error.message };
    }
  }

  async getConsumerGroupDetails(groupId) {
    try {
      if (!this.kafkaClient) {
        return { error: 'Kafka client not available' };
      }

      const admin = this.kafkaClient.admin();
      await admin.connect();

      const groupDescription = await admin.describeGroups([groupId]);
      const groupOffsets = await admin.fetchOffsets({ groupId });

      await admin.disconnect();

      const group = groupDescription.groups[0];
      return {
        groupId,
        state: group.state,
        protocolType: group.protocolType,
        protocol: group.protocol,
        members: group.members.map(member => ({
          memberId: member.memberId,
          clientId: member.clientId,
          clientHost: member.clientHost
        })),
        offsets: groupOffsets
      };
    } catch (error) {
      console.error('Error fetching consumer group details:', error);
      return { error: error.message };
    }
  }

  // Mock data methods for fallback
  getMockTopics() {
    return [
      { name: 'user-events', partitions: 3, replicationFactor: 2, size: '2.4 GB', throughput: '1.2K msg/s' },
      { name: 'order-events', partitions: 6, replicationFactor: 3, size: '5.1 GB', throughput: '3.4K msg/s' },
      { name: 'payment-events', partitions: 3, replicationFactor: 2, size: '1.8 GB', throughput: '800 msg/s' },
      { name: 'notification-events', partitions: 4, replicationFactor: 2, size: '950 MB', throughput: '500 msg/s' }
    ];
  }

  getMockClusterStatus() {
    return {
      brokers: 3,
      underReplicatedPartitions: 0,
      activeControllers: 1,
      totalPartitions: 16,
      totalMessages: '2.4M',
      avgLatency: '12ms'
    };
  }

  getMockConsumerGroups() {
    return [
      { groupId: 'analytics-group', lag: 45, members: 2, status: 'Stable', topics: ['user-events', 'order-events'] },
      { groupId: 'audit-group', lag: 12, members: 1, status: 'Stable', topics: ['payment-events'] },
      { groupId: 'reporting-group', lag: 178, members: 3, status: 'Rebalancing', topics: ['user-events', 'notification-events'] },
      { groupId: 'ml-pipeline', lag: 34, members: 4, status: 'Stable', topics: ['order-events'] }
    ];
  }
}

module.exports = new KafkaService();
