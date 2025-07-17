const { CloudWatchClient, GetMetricStatisticsCommand } = require('@aws-sdk/client-cloudwatch');

class MetricsService {
  constructor() {
    this.cloudWatchClient = new CloudWatchClient({
      region: process.env.AWS_REGION || 'us-east-1'
    });
  }

  async getKafkaMetrics() {
    try {
      const clusterName = process.env.MSK_CLUSTER_NAME;
      if (!clusterName) {
        console.warn('MSK_CLUSTER_NAME not configured, returning mock metrics');
        return this.getMockMetrics();
      }

      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - 5 * 60 * 1000); // Last 5 minutes

      // Get various MSK metrics from CloudWatch
      const metrics = await Promise.allSettled([
        this.getMetricData('AWS/Kafka', 'BytesInPerSec', clusterName, startTime, endTime),
        this.getMetricData('AWS/Kafka', 'BytesOutPerSec', clusterName, startTime, endTime),
        this.getMetricData('AWS/Kafka', 'MessagesInPerSec', clusterName, startTime, endTime),
        this.getMetricData('AWS/Kafka', 'ProduceMessageConversionsPerSec', clusterName, startTime, endTime),
        this.getMetricData('AWS/Kafka', 'ConsumerLag', clusterName, startTime, endTime)
      ]);

      return {
        bytesInPerSec: this.extractMetricValue(metrics[0]),
        bytesOutPerSec: this.extractMetricValue(metrics[1]),
        messagesInPerSec: this.extractMetricValue(metrics[2]),
        conversionsPerSec: this.extractMetricValue(metrics[3]),
        consumerLag: this.extractMetricValue(metrics[4]),
        timestamp: endTime.toISOString()
      };
    } catch (error) {
      console.error('Error fetching CloudWatch metrics:', error);
      return this.getMockMetrics();
    }
  }

  async getMetricData(namespace, metricName, clusterName, startTime, endTime) {
    const params = {
      Namespace: namespace,
      MetricName: metricName,
      Dimensions: [
        {
          Name: 'Cluster Name',
          Value: clusterName
        }
      ],
      StartTime: startTime,
      EndTime: endTime,
      Period: 300, // 5 minutes
      Statistics: ['Average']
    };

    const command = new GetMetricStatisticsCommand(params);
    return await this.cloudWatchClient.send(command);
  }

  extractMetricValue(settledResult) {
    if (settledResult.status === 'fulfilled' && settledResult.value.Datapoints.length > 0) {
      return settledResult.value.Datapoints[settledResult.value.Datapoints.length - 1].Average;
    }
    return 0;
  }

  getMockMetrics() {
    return {
      bytesInPerSec: 1024 * 1024 * 2.5, // 2.5 MB/s
      bytesOutPerSec: 1024 * 1024 * 3.2, // 3.2 MB/s
      messagesInPerSec: 6400,
      conversionsPerSec: 12,
      consumerLag: 45,
      timestamp: new Date().toISOString()
    };
  }

  async getBrokerMetrics(brokerId) {
    try {
      const clusterName = process.env.MSK_CLUSTER_NAME;
      if (!clusterName) {
        return this.getMockBrokerMetrics();
      }

      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - 5 * 60 * 1000);

      const metrics = await Promise.allSettled([
        this.getBrokerMetricData('CpuIdle', clusterName, brokerId, startTime, endTime),
        this.getBrokerMetricData('MemoryUsed', clusterName, brokerId, startTime, endTime),
        this.getBrokerMetricData('NetworkProcessorAvgIdlePercent', clusterName, brokerId, startTime, endTime)
      ]);

      return {
        brokerId,
        cpuUsage: 100 - this.extractMetricValue(metrics[0]),
        memoryUsage: this.extractMetricValue(metrics[1]),
        networkUsage: 100 - this.extractMetricValue(metrics[2]),
        timestamp: endTime.toISOString()
      };
    } catch (error) {
      console.error('Error fetching broker metrics:', error);
      return this.getMockBrokerMetrics();
    }
  }

  async getBrokerMetricData(metricName, clusterName, brokerId, startTime, endTime) {
    const params = {
      Namespace: 'AWS/Kafka',
      MetricName: metricName,
      Dimensions: [
        {
          Name: 'Cluster Name',
          Value: clusterName
        },
        {
          Name: 'Broker ID',
          Value: brokerId.toString()
        }
      ],
      StartTime: startTime,
      EndTime: endTime,
      Period: 300,
      Statistics: ['Average']
    };

    const command = new GetMetricStatisticsCommand(params);
    return await this.cloudWatchClient.send(command);
  }

  getMockBrokerMetrics() {
    return {
      brokerId: 1,
      cpuUsage: 68,
      memoryUsage: 72,
      networkUsage: 45,
      timestamp: new Date().toISOString()
    };
  }

  async getTopicMetrics(topicName) {
    try {
      const clusterName = process.env.MSK_CLUSTER_NAME;
      if (!clusterName) {
        return this.getMockTopicMetrics();
      }

      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - 5 * 60 * 1000);

      const metrics = await Promise.allSettled([
        this.getTopicMetricData('BytesInPerSec', clusterName, topicName, startTime, endTime),
        this.getTopicMetricData('BytesOutPerSec', clusterName, topicName, startTime, endTime),
        this.getTopicMetricData('MessagesInPerSec', clusterName, topicName, startTime, endTime)
      ]);

      return {
        topicName,
        bytesInPerSec: this.extractMetricValue(metrics[0]),
        bytesOutPerSec: this.extractMetricValue(metrics[1]),
        messagesInPerSec: this.extractMetricValue(metrics[2]),
        timestamp: endTime.toISOString()
      };
    } catch (error) {
      console.error('Error fetching topic metrics:', error);
      return this.getMockTopicMetrics();
    }
  }

  async getTopicMetricData(metricName, clusterName, topicName, startTime, endTime) {
    const params = {
      Namespace: 'AWS/Kafka',
      MetricName: metricName,
      Dimensions: [
        {
          Name: 'Cluster Name',
          Value: clusterName
        },
        {
          Name: 'Topic',
          Value: topicName
        }
      ],
      StartTime: startTime,
      EndTime: endTime,
      Period: 300,
      Statistics: ['Average']
    };

    const command = new GetMetricStatisticsCommand(params);
    return await this.cloudWatchClient.send(command);
  }

  getMockTopicMetrics() {
    return {
      topicName: 'user-events',
      bytesInPerSec: 1024 * 512, // 512 KB/s
      bytesOutPerSec: 1024 * 768, // 768 KB/s
      messagesInPerSec: 1200,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new MetricsService();
