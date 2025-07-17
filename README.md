# MSK InfraLens

## 🚀 Overview

**MSK InfraLens** is a modern, web-based monitoring dashboard for Apache Kafka infrastructure, specifically designed for Amazon Managed Streaming for Apache Kafka (MSK). It provides real-time insights into your Kafka clusters, topics, consumer groups, and overall system health through an intuitive and visually appealing interface.

![MSK InfraLens Dashboard](https://img.shields.io/badge/Status-Active-green) ![React](https://img.shields.io/badge/React-18.2.0-blue) ![License](https://img.shields.io/badge/License-MIT-yellow)

## 📸 Screenshots

### Main Dashboard
![MSK InfraLens Main Dashboard](./docs/images/main-dashboard.png)
*Real-time Kafka cluster monitoring with interactive metrics and visualizations*

### Features Preview
<details>
<summary>Click to view more screenshots</summary>

#### Cluster Overview
![Cluster Overview](./docs/images/cluster-overview.png)
*Comprehensive cluster health and performance metrics*

#### Topics Management
![Topics Management](./docs/images/topics-management.png)
*Topic management with detailed partition and replication information*

#### Consumer Groups
![Consumer Groups](./docs/images/consumer-groups.png)
*Real-time consumer group monitoring and lag tracking*

#### Analytics Dashboard
![Analytics Dashboard](./docs/images/analytics-dashboard.png)
*Performance analytics with alerts and notifications*

</details>

## 📋 Prerequisites

- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)
- **Git** (for cloning the repository)

## 📦 Installation

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd msk-infralens
```

### Step 2: Install Dependencies

#### Install Frontend Dependencies
```bash
npm install
```

#### Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

## 🚀 How to Execute the Project

### Option 1: Using VS Code Tasks (Recommended)
If you're using VS Code, you can use the predefined tasks:

1. **Start Frontend**: Press `Ctrl+Shift+P` → Type "Tasks: Run Task" → Select "Start MSK InfraLens Frontend"
2. **Start Backend**: Press `Ctrl+Shift+P` → Type "Tasks: Run Task" → Select "Start MSK InfraLens Backend"

### Option 2: Manual Command Line

#### Start Backend Server (Terminal 1)
```powershell
cd backend
npm start
```

#### Start Frontend Server (Terminal 2)
```powershell
npm start
```

### Step 3: Access the Application
- **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000](http://localhost:8000)

## 🛑 How to Stop Running Processes

### If Using VS Code Tasks
1. Open VS Code Terminal
2. Click on the terminal running the process
3. Press `Ctrl+C` to stop the process

### If Using Command Line
1. Go to the terminal window running the process
2. Press `Ctrl+C` to stop the server

### If Processes Are Running in Background
```powershell
# Check for Node.js processes running on ports 3000 and 8000
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# Kill specific process by PID (replace XXXX with actual PID)
taskkill /PID XXXX /F

# Or kill all Node.js processes (use with caution)
taskkill /IM node.exe /F
```

### Alternative: Kill by Port
```powershell
# Kill process running on port 3000 (Frontend)
netstat -ano | findstr :3000
# Note the PID and then:
taskkill /PID <PID> /F

# Kill process running on port 8000 (Backend)
netstat -ano | findstr :8000
# Note the PID and then:
taskkill /PID <PID> /F
```

## 🎯 Demo Mode vs AWS MSK Mode

### Demo Mode (No AWS Required)
- **Quick Setup**: Ready to run in 5 minutes
- **Mock Data**: Realistic fake data for testing
- **No Costs**: Completely free to run
- **Perfect for**: Testing, demos, development

### AWS MSK Mode (Production Ready)
- **Real Data**: Connect to your actual MSK cluster
- **Live Metrics**: Real-time Kafka monitoring
- **Production Ready**: Full monitoring capabilities
- **Setup Guide**: See [AWS_MSK_SETUP.md](AWS_MSK_SETUP.md)

## 📋 Features

### 🏠 Cluster Overview
- Real-time metrics monitoring
- Visual analytics with interactive charts
- Health monitoring and alerts
- Traffic visualization

### 📝 Topics Management
- Comprehensive topic overview
- Detailed partition and replication information
- Search and filter capabilities
- Management actions ready for API integration

### 👥 Consumer Groups Monitoring
- Real-time consumer group status
- Lag tracking across groups
- Member information and activity
- Topic associations

### 📈 Analytics & Insights
- Performance metrics dashboard
- Resource usage tracking
- Alert system with notifications
- Quick administrative actions

## 🛠️ Technology Stack

- **Frontend**: React 18.2.0 with Tailwind CSS
- **Backend**: Node.js with Express
- **HTTP Client**: Axios
- **Build Tool**: Create React App
- **UI Components**: Custom shadcn/ui inspired components

## 🔧 Configuration

### Demo Mode Setup
```bash
# Use demo configuration (if .env.demo exists)
copy .env.demo .env
```

### AWS MSK Setup
For production AWS MSK integration, follow the detailed guide in [AWS_MSK_SETUP.md](AWS_MSK_SETUP.md).

### Quick Switch to AWS MSK
Use the automated setup script to switch from demo to live MSK data:
```powershell
# Automated setup wizard for AWS MSK
.\switch-to-msk.ps1
```
This script will:
- Verify AWS CLI and credentials
- Test MSK cluster connectivity
- Stop running demo services
- Switch to AWS MSK configuration
- Start services with live data

### Test AWS MSK Connection
Before running the application with AWS MSK, you can test your connection:
```powershell
# Test your AWS MSK connection and configuration
.\test-msk-connection.ps1
```
This script will verify:
- AWS credentials are configured
- MSK cluster is accessible
- Bootstrap brokers can be discovered
- Application configuration is ready

## 🚦 Available NPM Scripts

### Frontend Scripts
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run eject      # Eject from Create React App (not recommended)
```

### Backend Scripts
```bash
cd backend
npm start          # Start backend server
npm run dev        # Start with nodemon (if available)
```

## 🚨 Troubleshooting

### Common Issues

#### Port Already in Use
```powershell
# If you get "port already in use" error:
netstat -ano | findstr :3000  # Check what's using port 3000
netstat -ano | findstr :8000  # Check what's using port 8000

# Kill the process using the port
taskkill /PID <PID> /F
```

#### Dependencies Issues
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# For backend
cd backend
rm -rf node_modules package-lock.json
npm install
```

#### Application Won't Start
1. Ensure Node.js version 16+ is installed
2. Check all dependencies are installed
3. Verify no other processes are using ports 3000/8000
4. Check console for error messages

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- Create an issue on GitHub
- Check the troubleshooting section above
- Review the setup documentation

### Documentation
- [Kafka Documentation](https://kafka.apache.org/documentation/)
- [Amazon MSK Documentation](https://docs.aws.amazon.com/msk/)
- [React Documentation](https://reactjs.org/docs/)

---

**Built with ❤️ for the Kafka community**
