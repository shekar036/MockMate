interface QuestionTemplate {
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  template: string;
  followUp?: string[];
}

interface RoleQuestions {
  [key: string]: QuestionTemplate[];
}

const QUESTION_TEMPLATES: RoleQuestions = {
  'Frontend Developer': [
    // Beginner Level
    {
      category: 'React Basics',
      difficulty: 'beginner',
      template: 'Explain the difference between functional and class components in React. When would you use each?',
      followUp: ['How do you handle state in functional components?', 'What are the benefits of hooks?']
    },
    {
      category: 'CSS Fundamentals',
      difficulty: 'beginner',
      template: 'How do you center a div both horizontally and vertically? Explain different approaches.',
      followUp: ['What are the pros and cons of flexbox vs grid?', 'How do you handle responsive design?']
    },
    {
      category: 'JavaScript Basics',
      difficulty: 'beginner',
      template: 'Explain the difference between let, const, and var in JavaScript.',
      followUp: ['What is hoisting?', 'How does scope work in JavaScript?']
    },
    
    // Intermediate Level
    {
      category: 'State Management',
      difficulty: 'intermediate',
      template: 'How would you implement global state management in a React application? Compare different approaches.',
      followUp: ['When would you use Context vs Redux?', 'How do you handle async actions?']
    },
    {
      category: 'Performance Optimization',
      difficulty: 'intermediate',
      template: 'What techniques do you use to optimize the performance of a React application?',
      followUp: ['How do you identify performance bottlenecks?', 'Explain React.memo and useMemo']
    },
    {
      category: 'Modern JavaScript',
      difficulty: 'intermediate',
      template: 'Explain how async/await works and how it differs from Promises and callbacks.',
      followUp: ['How do you handle error handling with async/await?', 'What is the event loop?']
    },
    
    // Advanced Level
    {
      category: 'Architecture',
      difficulty: 'advanced',
      template: 'How would you architect a large-scale React application with multiple teams working on it?',
      followUp: ['How do you handle code splitting?', 'What is micro-frontend architecture?']
    },
    {
      category: 'Advanced React',
      difficulty: 'advanced',
      template: 'Explain React\'s reconciliation algorithm and how virtual DOM works under the hood.',
      followUp: ['How does React Fiber improve performance?', 'What are React portals?']
    },
    {
      category: 'Testing',
      difficulty: 'advanced',
      template: 'How do you implement comprehensive testing for a React application? Discuss different testing strategies.',
      followUp: ['What is the testing pyramid?', 'How do you test custom hooks?']
    }
  ],

  'Backend Developer': [
    // Beginner Level
    {
      category: 'API Design',
      difficulty: 'beginner',
      template: 'Explain the principles of RESTful API design. What makes an API RESTful?',
      followUp: ['What are HTTP status codes?', 'How do you handle API versioning?']
    },
    {
      category: 'Database Basics',
      difficulty: 'beginner',
      template: 'What is the difference between SQL and NoSQL databases? When would you use each?',
      followUp: ['What is database normalization?', 'How do you handle database relationships?']
    },
    {
      category: 'Node.js Fundamentals',
      difficulty: 'beginner',
      template: 'Explain how Node.js event loop works and why Node.js is good for I/O intensive applications.',
      followUp: ['What is the difference between blocking and non-blocking operations?', 'How do you handle callbacks?']
    },
    
    // Intermediate Level
    {
      category: 'Authentication & Security',
      difficulty: 'intermediate',
      template: 'How do you implement secure authentication in a web application? Discuss JWT vs sessions.',
      followUp: ['How do you handle password security?', 'What is OAuth and when do you use it?']
    },
    {
      category: 'Database Optimization',
      difficulty: 'intermediate',
      template: 'How do you optimize database queries and improve database performance?',
      followUp: ['What are database indexes?', 'How do you handle database scaling?']
    },
    {
      category: 'Error Handling',
      difficulty: 'intermediate',
      template: 'How do you implement comprehensive error handling and logging in a backend application?',
      followUp: ['What is structured logging?', 'How do you handle different types of errors?']
    },
    
    // Advanced Level
    {
      category: 'Microservices',
      difficulty: 'advanced',
      template: 'How would you design a microservices architecture? What are the trade-offs compared to monoliths?',
      followUp: ['How do you handle inter-service communication?', 'What is service discovery?']
    },
    {
      category: 'Scalability',
      difficulty: 'advanced',
      template: 'How do you design a system to handle millions of concurrent users? Discuss scaling strategies.',
      followUp: ['What is horizontal vs vertical scaling?', 'How do you handle database sharding?']
    },
    {
      category: 'System Design',
      difficulty: 'advanced',
      template: 'Design a real-time chat application that can handle millions of users. What technologies would you use?',
      followUp: ['How do you handle message delivery guarantees?', 'What is eventual consistency?']
    }
  ],

  'Data Scientist': [
    // Beginner Level
    {
      category: 'Statistics Basics',
      difficulty: 'beginner',
      template: 'Explain the difference between correlation and causation. How do you identify each in data?',
      followUp: ['What is statistical significance?', 'How do you handle missing data?']
    },
    {
      category: 'Python for Data Science',
      difficulty: 'beginner',
      template: 'What are the key Python libraries for data science and what is each used for?',
      followUp: ['How do you handle large datasets in pandas?', 'What is vectorization in NumPy?']
    },
    {
      category: 'Data Visualization',
      difficulty: 'beginner',
      template: 'How do you choose the right type of visualization for different types of data?',
      followUp: ['What makes a good data visualization?', 'How do you avoid misleading visualizations?']
    },
    
    // Intermediate Level
    {
      category: 'Machine Learning',
      difficulty: 'intermediate',
      template: 'Explain the bias-variance tradeoff in machine learning. How do you balance it?',
      followUp: ['What is overfitting and how do you prevent it?', 'How do you choose between different algorithms?']
    },
    {
      category: 'Feature Engineering',
      difficulty: 'intermediate',
      template: 'How do you approach feature engineering for a machine learning project?',
      followUp: ['What is feature selection?', 'How do you handle categorical variables?']
    },
    {
      category: 'Model Evaluation',
      difficulty: 'intermediate',
      template: 'How do you evaluate the performance of a machine learning model? Discuss different metrics.',
      followUp: ['What is cross-validation?', 'How do you handle imbalanced datasets?']
    },
    
    // Advanced Level
    {
      category: 'Deep Learning',
      difficulty: 'advanced',
      template: 'Explain how neural networks learn through backpropagation. What are the challenges?',
      followUp: ['What is the vanishing gradient problem?', 'How do you choose network architecture?']
    },
    {
      category: 'MLOps',
      difficulty: 'advanced',
      template: 'How do you deploy and monitor machine learning models in production?',
      followUp: ['What is model drift?', 'How do you handle model versioning?']
    },
    {
      category: 'Advanced Analytics',
      difficulty: 'advanced',
      template: 'How would you design an A/B testing framework for a large-scale application?',
      followUp: ['What is statistical power?', 'How do you handle multiple testing problems?']
    }
  ],

  'DevOps Engineer': [
    // Beginner Level
    {
      category: 'Containerization',
      difficulty: 'beginner',
      template: 'Explain what Docker is and how it differs from virtual machines. What are the benefits?',
      followUp: ['What is a Dockerfile?', 'How do you optimize Docker images?']
    },
    {
      category: 'Version Control',
      difficulty: 'beginner',
      template: 'Explain Git workflow strategies. How do you handle branching and merging?',
      followUp: ['What is Git rebase vs merge?', 'How do you resolve merge conflicts?']
    },
    {
      category: 'Linux Basics',
      difficulty: 'beginner',
      template: 'What are the essential Linux commands every DevOps engineer should know?',
      followUp: ['How do you troubleshoot system performance?', 'What is process management in Linux?']
    },
    
    // Intermediate Level
    {
      category: 'CI/CD',
      difficulty: 'intermediate',
      template: 'How do you design and implement a CI/CD pipeline? What are the key stages?',
      followUp: ['How do you handle deployment rollbacks?', 'What is blue-green deployment?']
    },
    {
      category: 'Infrastructure as Code',
      difficulty: 'intermediate',
      template: 'Explain Infrastructure as Code. How do you manage infrastructure using tools like Terraform?',
      followUp: ['What is state management in Terraform?', 'How do you handle secrets in IaC?']
    },
    {
      category: 'Monitoring',
      difficulty: 'intermediate',
      template: 'How do you implement comprehensive monitoring and alerting for a distributed system?',
      followUp: ['What is the difference between metrics, logs, and traces?', 'How do you set up effective alerts?']
    },
    
    // Advanced Level
    {
      category: 'Kubernetes',
      difficulty: 'advanced',
      template: 'How would you design a Kubernetes cluster for a production environment? Discuss architecture and best practices.',
      followUp: ['How do you handle cluster security?', 'What is service mesh and when do you need it?']
    },
    {
      category: 'Cloud Architecture',
      difficulty: 'advanced',
      template: 'How do you design a multi-region, highly available cloud architecture?',
      followUp: ['How do you handle disaster recovery?', 'What is chaos engineering?']
    },
    {
      category: 'Security',
      difficulty: 'advanced',
      template: 'How do you implement security best practices in a DevOps pipeline?',
      followUp: ['What is shift-left security?', 'How do you handle compliance in automated deployments?']
    }
  ]
};

export interface GeneratedQuestion {
  id: string;
  question: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  followUp?: string[];
  context?: string;
}

export class QuestionGenerator {
  private usedQuestions: Set<string> = new Set();
  
  generateQuestions(
    role: string, 
    count: number = 5, 
    difficulty?: 'beginner' | 'intermediate' | 'advanced',
    categories?: string[]
  ): GeneratedQuestion[] {
    const roleQuestions = QUESTION_TEMPLATES[role];
    if (!roleQuestions) {
      throw new Error(`No questions available for role: ${role}`);
    }

    // Filter questions based on criteria
    let availableQuestions = roleQuestions.filter(q => {
      const matchesDifficulty = !difficulty || q.difficulty === difficulty;
      const matchesCategory = !categories || categories.includes(q.category);
      const notUsed = !this.usedQuestions.has(q.template);
      return matchesDifficulty && matchesCategory && notUsed;
    });

    // If we don't have enough unused questions, reset and allow reuse
    if (availableQuestions.length < count) {
      this.usedQuestions.clear();
      availableQuestions = roleQuestions.filter(q => {
        const matchesDifficulty = !difficulty || q.difficulty === difficulty;
        const matchesCategory = !categories || categories.includes(q.category);
        return matchesDifficulty && matchesCategory;
      });
    }

    // Shuffle and select questions
    const shuffled = this.shuffleArray([...availableQuestions]);
    const selected = shuffled.slice(0, count);

    // Mark as used and generate final questions
    const generatedQuestions: GeneratedQuestion[] = selected.map((template, index) => {
      this.usedQuestions.add(template.template);
      
      return {
        id: `${role}-${Date.now()}-${index}`,
        question: this.personalizeQuestion(template.template, role),
        category: template.category,
        difficulty: template.difficulty,
        followUp: template.followUp,
        context: this.generateContext(template.category, role)
      };
    });

    return generatedQuestions;
  }

  generateAdaptiveQuestions(
    role: string,
    previousAnswers: Array<{ question: string; score: number; category: string }>,
    count: number = 5
  ): GeneratedQuestion[] {
    // Analyze previous performance
    const averageScore = previousAnswers.length > 0 
      ? previousAnswers.reduce((sum, answer) => sum + answer.score, 0) / previousAnswers.length 
      : 5;

    // Determine difficulty based on performance
    let targetDifficulty: 'beginner' | 'intermediate' | 'advanced';
    if (averageScore >= 8) {
      targetDifficulty = 'advanced';
    } else if (averageScore >= 6) {
      targetDifficulty = 'intermediate';
    } else {
      targetDifficulty = 'beginner';
    }

    // Identify weak categories
    const categoryPerformance = previousAnswers.reduce((acc, answer) => {
      if (!acc[answer.category]) {
        acc[answer.category] = { total: 0, count: 0 };
      }
      acc[answer.category].total += answer.score;
      acc[answer.category].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const weakCategories = Object.entries(categoryPerformance)
      .filter(([_, perf]) => (perf.total / perf.count) < 6)
      .map(([category]) => category);

    // Generate questions focusing on weak areas
    if (weakCategories.length > 0) {
      return this.generateQuestions(role, count, targetDifficulty, weakCategories);
    }

    return this.generateQuestions(role, count, targetDifficulty);
  }

  private personalizeQuestion(template: string, role: string): string {
    const variations = {
      'Frontend Developer': {
        'your experience': 'your frontend development experience',
        'a project': 'a frontend project',
        'an application': 'a web application'
      },
      'Backend Developer': {
        'your experience': 'your backend development experience',
        'a project': 'a backend system',
        'an application': 'a server-side application'
      },
      'Data Scientist': {
        'your experience': 'your data science experience',
        'a project': 'a data science project',
        'an application': 'a machine learning model'
      },
      'DevOps Engineer': {
        'your experience': 'your DevOps experience',
        'a project': 'an infrastructure project',
        'an application': 'a deployment pipeline'
      }
    };

    let personalizedQuestion = template;
    const roleVariations = variations[role as keyof typeof variations];
    
    if (roleVariations) {
      Object.entries(roleVariations).forEach(([generic, specific]) => {
        personalizedQuestion = personalizedQuestion.replace(new RegExp(generic, 'gi'), specific);
      });
    }

    return personalizedQuestion;
  }

  private generateContext(category: string, role: string): string {
    const contexts = {
      'React Basics': 'This question assesses your fundamental understanding of React concepts.',
      'State Management': 'This evaluates your knowledge of managing application state effectively.',
      'Performance Optimization': 'This tests your ability to identify and resolve performance issues.',
      'API Design': 'This question evaluates your understanding of designing scalable APIs.',
      'Database Optimization': 'This assesses your knowledge of database performance tuning.',
      'Machine Learning': 'This tests your understanding of core ML concepts and algorithms.',
      'Containerization': 'This evaluates your knowledge of containerization technologies.',
      'CI/CD': 'This assesses your understanding of continuous integration and deployment.'
    };

    return contexts[category] || `This question tests your ${role.toLowerCase()} expertise.`;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  getAvailableCategories(role: string): string[] {
    const roleQuestions = QUESTION_TEMPLATES[role];
    if (!roleQuestions) return [];
    
    return [...new Set(roleQuestions.map(q => q.category))];
  }

  getDifficultyLevels(): Array<'beginner' | 'intermediate' | 'advanced'> {
    return ['beginner', 'intermediate', 'advanced'];
  }

  resetUsedQuestions(): void {
    this.usedQuestions.clear();
  }
}

export const questionGenerator = new QuestionGenerator();