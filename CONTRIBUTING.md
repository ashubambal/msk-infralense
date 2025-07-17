# Contributing to MSK InfraLens

Thank you for your interest in contributing to MSK InfraLens! This document provides guidelines and instructions for contributing to the project.

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- Git
- Basic knowledge of React and JavaScript
- Understanding of Apache Kafka concepts

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/msk-infralens.git`
3. Install dependencies: `npm install`
4. Start development server: `npm start`
5. Open `http://localhost:3000` in your browser

## 📝 How to Contribute

### Reporting Bugs
- Use the GitHub issue tracker
- Include detailed description and steps to reproduce
- Provide browser and Node.js version information
- Include screenshots if applicable

### Suggesting Features
- Create a feature request issue
- Describe the use case and benefits
- Provide mockups or examples if possible

### Code Contributions
1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Test your changes thoroughly
4. Commit with descriptive messages
5. Push to your fork
6. Create a Pull Request

### Code Style
- Use ESLint and Prettier configurations
- Follow React best practices
- Write meaningful variable and function names
- Add comments for complex logic
- Ensure responsive design

### Testing
- Test all new features manually
- Ensure no existing functionality is broken
- Test on different screen sizes
- Verify browser compatibility

## 🔍 Development Guidelines

### Component Structure
```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   └── ...
├── lib/              # Utility functions
└── KafkaDashboard.jsx # Main dashboard component
```

### Naming Conventions
- Components: PascalCase (e.g., `MyComponent`)
- Files: camelCase for JS, kebab-case for others
- Variables: camelCase
- Constants: UPPER_SNAKE_CASE

### Commit Messages
Use descriptive commit messages:
- `feat: add real-time chart integration`
- `fix: resolve consumer group status display issue`
- `docs: update installation instructions`
- `refactor: simplify dashboard state management`

## 🎯 Areas for Contribution

### High Priority
- Real-time data integration
- Chart library integration
- Authentication system
- Export functionality

### Medium Priority
- Performance optimizations
- Additional visualizations
- Mobile responsiveness
- Error handling improvements

### Low Priority
- Documentation improvements
- Code cleanup
- UI/UX enhancements
- Accessibility improvements

## 📋 Pull Request Process

1. Ensure your PR has a clear title and description
2. Reference any related issues
3. Include screenshots for UI changes
4. Update documentation if needed
5. Ensure all checks pass
6. Request review from maintainers

### PR Template
```
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
- [ ] Manual testing completed
- [ ] No existing functionality broken
- [ ] Responsive design verified

## Screenshots (if applicable)
Add screenshots here

## Related Issues
Fixes #123
```

## 🤝 Community

### Code of Conduct
- Be respectful and inclusive
- Provide constructive feedback
- Help newcomers
- Follow project guidelines

### Communication
- Use GitHub issues for bugs and features
- Be clear and concise in communications
- Respond to feedback promptly

## 📚 Resources

- [React Documentation](https://reactjs.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Kafka Documentation](https://kafka.apache.org/documentation/)
- [Git Best Practices](https://www.git-tower.com/learn/git/ebook)

## ❓ Questions?

If you have questions about contributing:
- Check existing issues and documentation
- Create a new issue with the "question" label
- Reach out to maintainers

Thank you for contributing to MSK InfraLens! 🎉
