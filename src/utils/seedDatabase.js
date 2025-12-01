import User from '../models/User.model.js';
import Project from '../models/Project.model.js';
import Task from '../models/Task.model.js';
import Comment from '../models/Comment.model.js';
import { connectDB } from '../config/database.js';

const projectStatuses = ['new', 'requirement-gathering', 'planning', 'execution', 'monitoring-and-control', 'close', 'block', 'wont-done'];
const taskStatuses = ['new', 'todo', 'inprogress', 'testing', 'done', 'block', 'wont-done'];

// Helper function to get random item from array
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

// Helper function to get random items from array
const getRandomItems = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Helper function to get future date
const getFutureDate = (daysAhead) => {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date;
};

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Comment.deleteMany({});
    await Task.deleteMany({});
    await Project.deleteMany({});
    await User.deleteMany({});

    // Create Admins
    console.log('👨‍💼 Creating admin users...');
    const admins = [];
    const adminData = [
      { name: 'Admin User', email: 'admin@example.com', password: 'admin123' },
      { name: 'Sarah Johnson', email: 'sarah.admin@example.com', password: 'admin123' },
      { name: 'Michael Chen', email: 'michael.admin@example.com', password: 'admin123' },
      { name: 'Emily Rodriguez', email: 'emily.admin@example.com', password: 'admin123' },
      { name: 'David Kim', email: 'david.admin@example.com', password: 'admin123' },
    ];

    for (const admin of adminData) {
      const newAdmin = await User.create({
        ...admin,
        role: 'admin',
        isVerified: true,
      });
      admins.push(newAdmin);
    }
    console.log(`✅ Created ${admins.length} admin users`);

    // Create Regular Users
    console.log('👥 Creating regular users...');
    const users = [];
    const userData = [
      { name: 'Normal User', email: 'user@example.com', password: 'user123' },
      { name: 'John Smith', email: 'john.smith@example.com', password: 'user123' },
      { name: 'Emma Watson', email: 'emma.watson@example.com', password: 'user123' },
      { name: 'Liam Brown', email: 'liam.brown@example.com', password: 'user123' },
      { name: 'Olivia Davis', email: 'olivia.davis@example.com', password: 'user123' },
      { name: 'Noah Wilson', email: 'noah.wilson@example.com', password: 'user123' },
      { name: 'Ava Martinez', email: 'ava.martinez@example.com', password: 'user123' },
      { name: 'Ethan Anderson', email: 'ethan.anderson@example.com', password: 'user123' },
      { name: 'Sophia Taylor', email: 'sophia.taylor@example.com', password: 'user123' },
      { name: 'Mason Thomas', email: 'mason.thomas@example.com', password: 'user123' },
      { name: 'Isabella Jackson', email: 'isabella.jackson@example.com', password: 'user123' },
      { name: 'Lucas White', email: 'lucas.white@example.com', password: 'user123' },
      { name: 'Mia Harris', email: 'mia.harris@example.com', password: 'user123' },
      { name: 'Benjamin Martin', email: 'benjamin.martin@example.com', password: 'user123' },
      { name: 'Charlotte Thompson', email: 'charlotte.thompson@example.com', password: 'user123' },
      { name: 'James Garcia', email: 'james.garcia@example.com', password: 'user123' },
      { name: 'Amelia Robinson', email: 'amelia.robinson@example.com', password: 'user123' },
      { name: 'Alexander Clark', email: 'alexander.clark@example.com', password: 'user123' },
      { name: 'Harper Lewis', email: 'harper.lewis@example.com', password: 'user123' },
      { name: 'Daniel Lee', email: 'daniel.lee@example.com', password: 'user123' },
    ];

    for (const user of userData) {
      const newUser = await User.create({
        ...user,
        role: 'user',
        isVerified: true,
      });
      users.push(newUser);
    }
    console.log(`✅ Created ${users.length} regular users`);

    const allUsers = [...admins, ...users];

    // Create Projects
    console.log('📁 Creating projects...');
    const projectsData = [
      {
        title: 'Examination Scheduling Software',
        description: 'A comprehensive examination scheduling system for educational institutions to manage exam timetables, venues, invigilators, and student allocations efficiently.',
        acceptanceCriteria: `
- Admin can create and manage exam schedules
- Support for multiple exam sessions per day
- Automatic conflict detection for students and rooms
- Invigilator assignment and notification system
- Student exam hall ticket generation
- Real-time schedule updates and notifications
- Export schedules to PDF and Excel
- Dashboard with exam statistics and analytics`,
        clientDetails: 'State University Board',
        status: 'execution',
        deadline: getFutureDate(90),
      },
      {
        title: 'AI-Enabled Mock Test Platform',
        description: 'An intelligent mock test platform using AI to generate personalized questions, provide instant feedback, and track student performance with detailed analytics.',
        acceptanceCriteria: `
- AI-powered question generation based on syllabus
- Adaptive difficulty based on student performance
- Real-time test monitoring and proctoring
- Detailed performance analytics and insights
- Question bank management system
- Multiple test formats (MCQ, descriptive, coding)
- Plagiarism detection using AI
- Mobile-responsive design for all devices`,
        clientDetails: 'EdTech Solutions Inc.',
        status: 'planning',
        deadline: getFutureDate(120),
      },
      {
        title: 'E-Commerce Application',
        description: 'A full-featured e-commerce platform with product catalog, shopping cart, payment gateway integration, order management, and customer review system.',
        acceptanceCriteria: `
- Product catalog with search and filters
- Shopping cart and wishlist functionality
- Secure payment gateway integration
- Order tracking and management
- Customer reviews and ratings
- Admin panel for inventory management
- Email notifications for orders
- Coupon and discount system
- Multi-vendor support
- Analytics dashboard for sales insights`,
        clientDetails: 'RetailMax Corporation',
        status: 'monitoring-and-control',
        deadline: getFutureDate(60),
      },
      {
        title: 'Video Calling Application',
        description: 'A real-time video calling application with HD quality streaming, screen sharing, chat, and recording features for remote collaboration.',
        acceptanceCriteria: `
- HD video and audio streaming
- Screen sharing functionality
- Group video calls (up to 50 participants)
- Chat messaging during calls
- Call recording and playback
- Virtual backgrounds and filters
- Call scheduling and calendar integration
- Cross-platform support (Web, iOS, Android)
- End-to-end encryption for security
- Admin controls and moderation tools`,
        clientDetails: 'ConnectNow Technologies',
        status: 'execution',
        deadline: getFutureDate(75),
      },
    ];

    const projects = [];
    for (const projectData of projectsData) {
      const assignee = getRandomItem(allUsers);
      const members = getRandomItems(allUsers.filter(u => u._id.toString() !== assignee._id.toString()), 8);
      const createdBy = getRandomItem(admins);

      const project = await Project.create({
        ...projectData,
        assignee: assignee._id,
        members: members.map(m => m._id),
        createdBy: createdBy._id,
      });
      projects.push(project);
    }
    console.log(`✅ Created ${projects.length} projects`);

    // Create Tasks and Subtasks
    console.log('📝 Creating tasks and subtasks...');
    let totalTasks = 0;
    let totalSubtasks = 0;

    for (const project of projects) {
      const projectMembers = [
        project.assignee,
        ...project.members,
      ];

      // Task templates based on project type
      let taskTemplates = [];
      
      if (project.title.includes('Examination')) {
        taskTemplates = [
          { title: 'Design Database Schema', desc: 'Create comprehensive database schema for exam scheduling system' },
          { title: 'Implement User Authentication', desc: 'Build secure authentication system with role-based access' },
          { title: 'Create Admin Dashboard', desc: 'Design and implement admin control panel' },
          { title: 'Develop Exam Schedule Module', desc: 'Build exam scheduling functionality with conflict detection' },
          { title: 'Implement Room Allocation System', desc: 'Create automatic room allocation algorithm' },
          { title: 'Build Invigilator Management', desc: 'Develop invigilator assignment and scheduling system' },
          { title: 'Create Student Portal', desc: 'Build student interface for viewing schedules' },
          { title: 'Implement Notification System', desc: 'Set up email and SMS notifications' },
          { title: 'Develop Reporting Module', desc: 'Create reports and analytics dashboard' },
          { title: 'Build Hall Ticket Generator', desc: 'Implement hall ticket generation and printing' },
          { title: 'Create Timetable Conflict Checker', desc: 'Build algorithm to detect scheduling conflicts' },
          { title: 'Implement PDF Export', desc: 'Add functionality to export schedules to PDF' },
          { title: 'Develop Mobile App', desc: 'Create mobile application for students and staff' },
          { title: 'Build Calendar Integration', desc: 'Integrate with Google Calendar and Outlook' },
          { title: 'Implement Seating Arrangement', desc: 'Create seating arrangement generator' },
          { title: 'Add Multi-language Support', desc: 'Implement internationalization' },
        ];
      } else if (project.title.includes('AI-Enabled')) {
        taskTemplates = [
          { title: 'Setup AI Model Infrastructure', desc: 'Configure AI/ML infrastructure and services' },
          { title: 'Implement Question Generation AI', desc: 'Build AI model for generating test questions' },
          { title: 'Create Test Interface', desc: 'Design and build test-taking interface' },
          { title: 'Develop Adaptive Learning Algorithm', desc: 'Implement algorithm to adjust difficulty' },
          { title: 'Build Question Bank System', desc: 'Create system to manage question repository' },
          { title: 'Implement Proctoring System', desc: 'Add AI-based proctoring and monitoring' },
          { title: 'Create Performance Analytics', desc: 'Build detailed analytics and reporting' },
          { title: 'Develop Student Dashboard', desc: 'Create student performance dashboard' },
          { title: 'Implement Auto-grading', desc: 'Build automatic answer evaluation system' },
          { title: 'Add Video Proctoring', desc: 'Integrate video monitoring during tests' },
          { title: 'Create Test Scheduler', desc: 'Build test scheduling and management system' },
          { title: 'Implement Plagiarism Detection', desc: 'Add AI-based plagiarism checker' },
          { title: 'Build Mobile App', desc: 'Develop mobile application for tests' },
          { title: 'Add Real-time Monitoring', desc: 'Implement live test monitoring dashboard' },
          { title: 'Create Certificate Generator', desc: 'Build automatic certificate generation' },
          { title: 'Implement Result Analytics', desc: 'Add detailed result analysis features' },
        ];
      } else if (project.title.includes('E-Commerce')) {
        taskTemplates = [
          { title: 'Design Product Catalog', desc: 'Create product catalog structure and UI' },
          { title: 'Implement Shopping Cart', desc: 'Build shopping cart functionality' },
          { title: 'Integrate Payment Gateway', desc: 'Add payment processing with Stripe/Razorpay' },
          { title: 'Build Order Management', desc: 'Create order tracking and management system' },
          { title: 'Develop User Profiles', desc: 'Build user account and profile management' },
          { title: 'Implement Product Search', desc: 'Add advanced search and filtering' },
          { title: 'Create Review System', desc: 'Build product review and rating system' },
          { title: 'Develop Admin Panel', desc: 'Create comprehensive admin dashboard' },
          { title: 'Implement Inventory Management', desc: 'Build inventory tracking system' },
          { title: 'Add Wishlist Feature', desc: 'Implement wishlist functionality' },
          { title: 'Create Coupon System', desc: 'Build discount and coupon management' },
          { title: 'Implement Shipping Integration', desc: 'Integrate with shipping providers' },
          { title: 'Build Analytics Dashboard', desc: 'Create sales analytics and reports' },
          { title: 'Add Multi-vendor Support', desc: 'Implement multi-vendor marketplace' },
          { title: 'Create Email Notifications', desc: 'Build automated email system' },
          { title: 'Implement Mobile App', desc: 'Develop native mobile applications' },
        ];
      } else if (project.title.includes('Video Calling')) {
        taskTemplates = [
          { title: 'Setup WebRTC Infrastructure', desc: 'Configure WebRTC servers and infrastructure' },
          { title: 'Implement Video Streaming', desc: 'Build real-time video streaming functionality' },
          { title: 'Add Audio Processing', desc: 'Implement audio capture and processing' },
          { title: 'Create Screen Sharing', desc: 'Build screen sharing functionality' },
          { title: 'Implement Chat System', desc: 'Add real-time text chat during calls' },
          { title: 'Build Call Recording', desc: 'Create call recording and playback features' },
          { title: 'Add Virtual Backgrounds', desc: 'Implement virtual background and filters' },
          { title: 'Create Call Scheduling', desc: 'Build meeting scheduling system' },
          { title: 'Implement Group Calls', desc: 'Add support for multiple participants' },
          { title: 'Build User Authentication', desc: 'Create secure login and access control' },
          { title: 'Add End-to-End Encryption', desc: 'Implement security and encryption' },
          { title: 'Create Admin Controls', desc: 'Build host controls and moderation' },
          { title: 'Implement Mobile Apps', desc: 'Develop iOS and Android applications' },
          { title: 'Add Calendar Integration', desc: 'Integrate with Google Calendar' },
          { title: 'Build Analytics Dashboard', desc: 'Create usage statistics and analytics' },
          { title: 'Implement Waiting Room', desc: 'Add waiting room functionality' },
        ];
      }

      // Create 15+ tasks for each project
      for (let i = 0; i < taskTemplates.length; i++) {
        const template = taskTemplates[i];
        const taskAssignee = getRandomItem(projectMembers);
        const taskMembers = getRandomItems(
          projectMembers.filter(u => u._id ? u._id.toString() !== taskAssignee._id.toString() : u.toString() !== taskAssignee.toString()),
          3
        );

        const task = await Task.create({
          title: template.title,
          description: template.desc,
          acceptanceCriteria: `Task should be completed with proper testing and documentation. All edge cases should be handled. Code should follow best practices and be production-ready.`,
          project: project._id,
          parentTask: null,
          members: taskMembers.map(m => m._id || m),
          deadline: getFutureDate(30 + i * 3),
          status: getRandomItem(taskStatuses),
          assignee: taskAssignee._id || taskAssignee,
          createdBy: project.createdBy,
        });

        totalTasks++;

        // Create 5+ subtasks for each task
        const subtaskTemplates = [
          { title: 'Setup Development Environment', desc: 'Configure local development setup' },
          { title: 'Write Unit Tests', desc: 'Create comprehensive unit tests' },
          { title: 'Implement Core Logic', desc: 'Build main functionality' },
          { title: 'Create UI Components', desc: 'Design and implement user interface' },
          { title: 'Code Review and Refactoring', desc: 'Review code and refactor for quality' },
          { title: 'Write Documentation', desc: 'Create technical documentation' },
          { title: 'Integration Testing', desc: 'Perform integration testing' },
          { title: 'Bug Fixes and Optimization', desc: 'Fix bugs and optimize performance' },
        ];

        for (let j = 0; j < 8; j++) {
          const subtaskTemplate = subtaskTemplates[j];
          const subtaskAssignee = getRandomItem(projectMembers);

          await Task.create({
            title: subtaskTemplate.title,
            description: subtaskTemplate.desc,
            acceptanceCriteria: 'Subtask should be completed as per requirements with proper testing.',
            project: project._id,
            parentTask: task._id,
            members: [subtaskAssignee._id || subtaskAssignee],
            deadline: getFutureDate(20 + j * 2),
            status: getRandomItem(taskStatuses),
            assignee: subtaskAssignee._id || subtaskAssignee,
            createdBy: project.createdBy,
          });

          totalSubtasks++;
        }
      }
    }

    console.log(`✅ Created ${totalTasks} tasks`);
    console.log(`✅ Created ${totalSubtasks} subtasks`);

    // Create some comments
    console.log('💬 Creating comments...');
    const allTasks = await Task.find();
    const commentTemplates = [
      'Great progress on this task!',
      'Please review the implementation.',
      'Added the required changes.',
      'Testing completed successfully.',
      'Found some issues, working on fixes.',
      'Documentation updated.',
      'Ready for review.',
      'Deployed to staging environment.',
    ];

    let totalComments = 0;
    for (const task of allTasks.slice(0, 50)) {
      const numComments = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numComments; i++) {
        const commenter = getRandomItem(allUsers);
        await Comment.create({
          text: getRandomItem(commentTemplates),
          sentBy: commenter._id,
          task: task._id,
          project: null,
        });
        totalComments++;
      }
    }
    console.log(`✅ Created ${totalComments} comments`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${admins.length} Admins`);
    console.log(`   - ${users.length} Users`);
    console.log(`   - ${projects.length} Projects`);
    console.log(`   - ${totalTasks} Tasks`);
    console.log(`   - ${totalSubtasks} Subtasks`);
    console.log(`   - ${totalComments} Comments`);
    console.log('\n🔐 Login Credentials:');
    console.log('   Admin: admin@example.com / admin123');
    console.log('   User:  user@example.com / user123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
