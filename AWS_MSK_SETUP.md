# 🚀 AWS MSK Integration Guide - Ready for Your Cluster

This guide will help you connect your MSK InfraLens dashboard to your real AWS MSK cluster.

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ AWS Account with appropriate permissions
- ✅ AWS MSK cluster already running
- ✅ AWS CLI installed and configured (recommended)
- ✅ Node.js and npm installed (no Docker needed)

## 🎯 Quick Setup for Your Cluster

**Your MSK Cluster ARN**: 
```
arn:aws:kafka:us-west-2:032474939542:cluster/shared-msk01-us-west-2/1cb2dbee-738b-4898-a87e-d8279936052f-4
```

### Step 1: Configure AWS Credentials
```powershell
# Configure AWS CLI with your credentials
aws configure
# Enter your:
# - AWS Access Key ID
# - AWS Secret Access Key  
# - Default region: us-west-2
# - Default output format: json
```

### Step 2: Test MSK Access
```powershell
# Verify you can access your cluster
aws kafka describe-cluster --cluster-arn "arn:aws:kafka:us-west-2:032474939542:cluster/shared-msk01-us-west-2/1cb2dbee-738b-4898-a87e-d8279936052f-4"

# Get bootstrap brokers
aws kafka get-bootstrap-brokers --cluster-arn "arn:aws:kafka:us-west-2:032474939542:cluster/shared-msk01-us-west-2/1cb2dbee-738b-4898-a87e-d8279936052f-4"
```

### Step 3: Switch to Live Mode
```powershell
# Stop current demo services
taskkill /F /IM node.exe

# Copy AWS configuration (already configured for your cluster)
copy .env.aws-msk .env

# Start with real MSK data
npm run start:dev
```

## 🔑 Important: Your Cluster Uses IAM Authentication

Based on your provided configuration, your MSK cluster uses **IAM authentication** with these settings:
```
security.protocol=SASL_SSL
sasl.mechanism=AWS_MSK_IAM
```

This means you need:
1. ✅ AWS credentials configured (`aws configure`)
2. ✅ IAM permissions for MSK access
3. ✅ IAM authentication enabled (already configured in .env.aws-msk)

### Required IAM Permissions
Your AWS user/role needs these permissions for your cluster:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "kafka-cluster:Connect",
                "kafka-cluster:DescribeCluster",
                "kafka-cluster:DescribeGroup",
                "kafka-cluster:DescribeTopic",
                "kafka-cluster:ReadData"
            ],
            "Resource": [
                "arn:aws:kafka:us-west-2:032474939542:cluster/shared-msk01-us-west-2/*",
                "arn:aws:kafka:us-west-2:032474939542:topic/shared-msk01-us-west-2/*/*",
                "arn:aws:kafka:us-west-2:032474939542:group/shared-msk01-us-west-2/*/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "kafka:DescribeCluster",
                "kafka:GetBootstrapBrokers"
            ],
            "Resource": "arn:aws:kafka:us-west-2:032474939542:cluster/shared-msk01-us-west-2/*"
        }
    ]
}
```

---

## 📊 Step 1: Get Your MSK Cluster Information

### Option A: Using AWS Console

1. **Navigate to Amazon MSK**:
   - Go to AWS Console → Services → Amazon MSK
   - Select your cluster

2. **Collect Required Information**:
   ```
   Cluster Name: my-kafka-cluster
   Cluster ARN: arn:aws:kafka:us-east-1:123456789012:cluster/my-kafka-cluster/abc123
   Bootstrap Servers: b-1.my-kafka-cluster.kafka.us-east-1.amazonaws.com:9092
   ```

3. **Note the Security Settings**:
   - Check if SASL/SCRAM authentication is enabled
   - Note the VPC and security groups

### Option B: Using AWS CLI

```bash
# List all MSK clusters
aws kafka list-clusters --region us-east-1

# Get specific cluster details
aws kafka describe-cluster --cluster-arn "your-cluster-arn"

# Get bootstrap brokers
aws kafka get-bootstrap-brokers --cluster-arn "your-cluster-arn"
```

**Sample Output:**
```json
{
  "BootstrapBrokerString": "b-1.my-cluster.kafka.us-east-1.amazonaws.com:9092,b-2.my-cluster.kafka.us-east-1.amazonaws.com:9092"
}
```

---

## 🔐 Step 2: Configure AWS Credentials

### Option A: IAM User Access Keys (Simple)

1. **Create IAM User** with these permissions:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "kafka:DescribeCluster",
           "kafka:GetBootstrapBrokers",
           "kafka:ListClusters",
           "kafka:ListNodes",
           "cloudwatch:GetMetricStatistics",
           "cloudwatch:ListMetrics"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

2. **Generate Access Keys**:
   - AWS Console → IAM → Users → Your User → Security Credentials
   - Create Access Key → Store securely

### Option B: IAM Roles (Recommended for Production)

```bash
# If running on EC2, attach IAM role with MSK permissions
# No access keys needed - uses instance profile
```

---

## ⚙️ Step 3: Update Environment Configuration

### Create Your Environment File

```bash
# Copy demo environment
cp .env.demo .env

# Edit the file
nano .env  # or use your preferred editor
```

### Configure for AWS MSK

```bash
# ==============================================
# 🚀 AWS MSK INTEGRATION - LIVE CONFIGURATION
# ==============================================

# IMPORTANT: Switch to live data mode
REACT_APP_MOCK_DATA=false

# Frontend Configuration
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_REFRESH_INTERVAL=30000
REACT_APP_ENABLE_REAL_TIME=true

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA1234567890EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

# MSK Cluster Configuration (Replace with your values)
MSK_CLUSTER_ARN=arn:aws:kafka:us-east-1:123456789012:cluster/my-kafka-cluster/abc123
MSK_CLUSTER_NAME=my-kafka-cluster
KAFKA_BOOTSTRAP_SERVERS=b-1.my-cluster.kafka.us-east-1.amazonaws.com:9092,b-2.my-cluster.kafka.us-east-1.amazonaws.com:9092

# Only if using SASL authentication
KAFKA_SASL_MECHANISM=SCRAM-SHA-512
KAFKA_SASL_USERNAME=my-kafka-user
KAFKA_SASL_PASSWORD=my-secure-password

# API Configuration
PORT=8000
NODE_ENV=production
LOG_LEVEL=info
```

---

## 🧪 Step 4: Test Connection

### Start Services and Test

```powershell
# Start both services
npm run start:dev

# Check backend health
Invoke-WebRequest -Uri "http://localhost:8000/api/kafka/cluster-status" | Select-Object -ExpandProperty Content

# Test Kafka connection
curl http://localhost:8000/api/kafka/topics
```

### Expected Responses

**Health Check (Should return):**
```json
{
  "status": "OK",
  "timestamp": "2025-07-11T10:30:00.000Z"
}
```

**Topics Endpoint (Should return your real topics):**
```json
[
  {
    "name": "your-actual-topic-name",
    "partitions": 3,
    "replicationFactor": 2,
    "size": "N/A",
    "throughput": "N/A"
  }
]
```

### Check Dashboard

1. **Open Frontend**: http://localhost:3000
2. **Look for Indicators**:
   - 🟢 Connected (top right)
   - Real topic names instead of demo data
   - No "🎭 Demo Mode" badge

---

## 🔧 Step 5: Troubleshooting Common Issues

### Issue 1: Connection Timeout

**Symptoms**: Backend logs show "connection timeout"

**Solutions**:
```bash
# Check security groups allow inbound traffic on Kafka ports
# Default MSK ports: 9092 (plaintext), 9094 (TLS), 9096 (SASL)

# Verify your security group rules:
aws ec2 describe-security-groups --group-ids sg-xxxxxxxxx
```

### Issue 2: Authentication Failed

**Symptoms**: "SASL authentication failed"

**Solutions**:
1. **Verify credentials** in AWS Secrets Manager
2. **Check SASL configuration** in MSK cluster
3. **Ensure user exists** and has proper permissions

### Issue 3: No CloudWatch Metrics

**Symptoms**: Performance metrics show "N/A"

**Solutions**:
1. **Enable enhanced monitoring** on MSK cluster
2. **Verify CloudWatch permissions** in IAM policy
3. **Check MSK_CLUSTER_NAME** matches exactly

### Issue 4: CORS Errors

**Symptoms**: Browser console shows CORS errors

**Solutions**:
```bash
# Update backend environment
FRONTEND_URL=http://localhost:3000

# Restart backend service
docker-compose restart msk-api
```

---

## 📊 Step 6: Verify Real Data Integration

### Dashboard Features with Real Data

- ✅ **Real Topic Names**: See your actual Kafka topics
- ✅ **Live Partition Count**: Actual partition configuration
- ✅ **Consumer Groups**: Real consumer group status and lag
- ✅ **Broker Information**: Actual broker count and health
- ✅ **CloudWatch Metrics**: Performance data from AWS

### Monitoring Real-Time Updates

```bash
# Watch backend logs for real-time data fetching
docker-compose logs -f msk-api

# Look for successful API calls:
# "Fetching Kafka topics"
# "Fetching cluster status"
# "Fetching consumer groups"
```

---

## 🚀 Advanced Configuration

### Environment-Specific Setup

**Development:**
```bash
NODE_ENV=development
LOG_LEVEL=debug
REACT_APP_DEBUG_MODE=true
```

**Production:**
```bash
NODE_ENV=production
LOG_LEVEL=warn
REACT_APP_DEBUG_MODE=false
```

### Custom Metrics Configuration

```bash
# CloudWatch custom namespace
CLOUDWATCH_NAMESPACE=Custom/Kafka

# Custom metrics refresh interval (milliseconds)
METRICS_REFRESH_INTERVAL=60000
```

### Security Enhancements

```bash
# Use AWS Secrets Manager for sensitive data
AWS_SECRETS_MANAGER_SECRET_ID=prod/msk-infralens/kafka-credentials

# Enable TLS for API
ENABLE_HTTPS=true
SSL_CERT_PATH=/path/to/cert.pem
SSL_KEY_PATH=/path/to/key.pem
```

---

## 🔄 Switching Between Demo and Live Mode

### Switch to Live Mode

```bash
# Edit .env file
REACT_APP_MOCK_DATA=false

# Restart services
docker-compose restart
```

### Switch Back to Demo Mode

```bash
# Edit .env file
REACT_APP_MOCK_DATA=true

# Restart services
docker-compose restart
```

---

## 📈 Production Deployment

### AWS ECS/Fargate

```yaml
# task-definition.json
{
  "family": "msk-infralens",
  "taskRoleArn": "arn:aws:iam::123456789012:role/msk-infralens-task-role",
  "containerDefinitions": [
    {
      "name": "msk-ui",
      "image": "your-ecr-repo/msk-infralens:latest",
      "portMappings": [{"containerPort": 80, "protocol": "tcp"}],
      "environment": [
        {"name": "REACT_APP_MOCK_DATA", "value": "false"},
        {"name": "REACT_APP_API_BASE_URL", "value": "http://msk-api:8000"}
      ]
    }
  ]
}
```

### Docker Swarm

```bash
# Deploy with environment file
docker stack deploy -c docker-compose.yml --env-file .env.production msk-infralens
```

---

## 📚 Additional Resources

- **AWS MSK Documentation**: https://docs.aws.amazon.com/msk/
- **Kafka Client Configuration**: https://kafka.apache.org/documentation/#configuration
- **CloudWatch Metrics**: https://docs.aws.amazon.com/msk/latest/developerguide/monitoring.html
- **Security Best Practices**: https://docs.aws.amazon.com/msk/latest/developerguide/security.html

---

## 🆘 Getting Help

If you encounter issues:

1. **Check logs**: `docker-compose logs msk-api`
2. **Verify network connectivity**: Test from the container
3. **Review AWS permissions**: Ensure IAM policies are correct
4. **Test with AWS CLI**: Verify cluster accessibility

**Need more help?** Create an issue with:
- Your configuration (remove sensitive data)
- Error logs
- AWS MSK cluster configuration
- Network setup details

---

**🎉 Congratulations! Your MSK InfraLens dashboard is now connected to real AWS MSK data!**
