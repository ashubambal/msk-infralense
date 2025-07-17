const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const winston = require('winston');
require('dotenv').config();

const kafkaService = require('./services/kafkaService');
const metricsService = require('./services/metricsService');

const app = express();
const PORT = process.env.PORT || 8000;

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' })
  ]
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.get('/api/kafka/topics', async (req, res) => {
  try {
    logger.info('Fetching Kafka topics');
    const topics = await kafkaService.getTopics();
    res.json(topics);
  } catch (error) {
    logger.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

app.get('/api/kafka/cluster-status', async (req, res) => {
  try {
    logger.info('Fetching cluster status');
    const clusterStatus = await kafkaService.getClusterStatus();
    res.json(clusterStatus);
  } catch (error) {
    logger.error('Error fetching cluster status:', error);
    res.status(500).json({ error: 'Failed to fetch cluster status' });
  }
});

app.get('/api/kafka/consumer-groups', async (req, res) => {
  try {
    logger.info('Fetching consumer groups');
    const consumerGroups = await kafkaService.getConsumerGroups();
    res.json(consumerGroups);
  } catch (error) {
    logger.error('Error fetching consumer groups:', error);
    res.status(500).json({ error: 'Failed to fetch consumer groups' });
  }
});

app.get('/api/kafka/metrics', async (req, res) => {
  try {
    logger.info('Fetching Kafka metrics');
    const metrics = await metricsService.getKafkaMetrics();
    res.json(metrics);
  } catch (error) {
    logger.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Topic details endpoint
app.get('/api/kafka/topics/:topicName', async (req, res) => {
  try {
    const { topicName } = req.params;
    logger.info(`Fetching details for topic: ${topicName}`);
    const topicDetails = await kafkaService.getTopicDetails(topicName);
    res.json(topicDetails);
  } catch (error) {
    logger.error('Error fetching topic details:', error);
    res.status(500).json({ error: 'Failed to fetch topic details' });
  }
});

// Consumer group details endpoint
app.get('/api/kafka/consumer-groups/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    logger.info(`Fetching details for consumer group: ${groupId}`);
    const groupDetails = await kafkaService.getConsumerGroupDetails(groupId);
    res.json(groupDetails);
  } catch (error) {
    logger.error('Error fetching consumer group details:', error);
    res.status(500).json({ error: 'Failed to fetch consumer group details' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`MSK InfraLens API server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`AWS Region: ${process.env.AWS_REGION || 'us-east-1'}`);
});
