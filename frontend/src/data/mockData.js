export const requirementsData = {
  projectName: "Hospital Management System",

  overview:
    "A centralized software platform designed to manage hospital operations including patients, doctors, appointments, billing, and administration.",

  userRoles: [
    "Administrator",
    "Doctor",
    "Patient",
    "Receptionist",
  ],

  functionalRequirements: [
    {
      id: "FR-001",
      title: "User Authentication",
      description:
        "Users should securely login and access the system based on their role.",
    },
    {
      id: "FR-002",
      title: "Patient Management",
      description:
        "The system should allow administrators to create, update, and manage patient records.",
    },
    {
      id: "FR-003",
      title: "Doctor Management",
      description:
        "The system should manage doctor profiles, departments, and availability.",
    },
    {
      id: "FR-004",
      title: "Appointment Booking",
      description:
        "Patients should be able to book appointments with available doctors.",
    },
    {
      id: "FR-005",
      title: "Billing Management",
      description:
        "The system should generate and manage patient bills.",
    },
  ],

  nonFunctionalRequirements: [
    "Secure authentication and authorization",
    "Fast API response time",
    "Scalable system architecture",
    "Data privacy and security",
    "Reliable database backups",
  ],
};

export const planningData = {
  estimatedDuration: "6 Weeks",

  modules: [
    {
      name: "Authentication",
      priority: "HIGH",
    },
    {
      name: "Patient Management",
      priority: "HIGH",
    },
    {
      name: "Doctor Management",
      priority: "HIGH",
    },
    {
      name: "Appointment System",
      priority: "HIGH",
    },
    {
      name: "Billing System",
      priority: "MEDIUM",
    },
  ],

  sprints: [
    {
      sprint: "Sprint 1",
      goal: "Foundation and Authentication",
      priority: "HIGH",
      tasks: [
        "Set up project repository",
        "Configure backend",
        "Create authentication APIs",
        "Implement user roles",
      ],
    },
    {
      sprint: "Sprint 2",
      goal: "Patient and Doctor Management",
      priority: "HIGH",
      tasks: [
        "Create patient CRUD APIs",
        "Create doctor CRUD APIs",
        "Build patient management UI",
        "Build doctor management UI",
      ],
    },
    {
      sprint: "Sprint 3",
      goal: "Appointment Management",
      priority: "HIGH",
      tasks: [
        "Design appointment workflow",
        "Create appointment APIs",
        "Implement scheduling system",
        "Add appointment dashboard",
      ],
    },
    {
      sprint: "Sprint 4",
      goal: "Billing and Final Integration",
      priority: "MEDIUM",
      tasks: [
        "Create billing module",
        "Integrate all modules",
        "Testing",
        "Documentation",
      ],
    },
  ],
};

export const architectureData = {
  pattern: "Layered MVC Architecture",

  stack: [
    {
      layer: "Frontend",
      technology: "React + Vite",
    },
    {
      layer: "API Layer",
      technology: "FastAPI",
    },
    {
      layer: "AI Agent Layer",
      technology: "LangGraph + LLM",
    },
    {
      layer: "Database",
      technology: "PostgreSQL",
    },
  ],

  components: [
    "React Frontend",
    "FastAPI Backend",
    "Coordinator Agent",
    "Requirements Agent",
    "Planning Agent",
    "Architecture Agent",
    "PostgreSQL Database",
  ],

  folderStructure: [
    "frontend/",
    "backend/",
    "backend/agents/",
    "backend/graph/",
    "backend/services/",
    "backend/schemas/",
  ],
};