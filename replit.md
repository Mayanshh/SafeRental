# Overview

SafeRental is a web application for creating and managing legally compliant rental agreements with built-in verification features. The platform allows tenants to create rental agreements and landlords to verify them, providing secure document management, OTP-based verification, and PDF generation capabilities. The system is designed to protect both tenants and landlords through a trusted verification process.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built using React with TypeScript, implementing a modern component-based architecture. The application uses Vite as the build tool and development server, providing fast hot module replacement and optimized production builds. The UI is constructed with shadcn/ui components based on Radix UI primitives, styled with Tailwind CSS for consistent design patterns. Client-side routing is handled by Wouter for lightweight navigation between pages including home, agreement creation, verification, and dashboard views.

State management is implemented using React Query (TanStack Query) for server state management, providing caching, synchronization, and background updates. Local component state is managed through React hooks. The application follows a mobile-first responsive design approach with proper accessibility considerations built into the component library.

## Backend Architecture
The backend follows a REST API architecture built with Express.js and TypeScript. The server implements a layered architecture with clear separation of concerns:

- **Route Layer**: Handles HTTP requests and responses, input validation using Zod schemas
- **Service Layer**: Contains business logic for email sending, PDF generation, and Firebase integration
- **Storage Layer**: Abstracts data persistence with an interface-based approach, currently implementing in-memory storage for development

The API supports file uploads using Multer for handling ID proof documents, with proper file size limits and type validation. Error handling is centralized through Express middleware for consistent error responses.

## Data Storage Solutions
The application uses a hybrid storage approach designed for scalability:

- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations and migrations
- **Development Storage**: In-memory storage implementation for rapid development and testing
- **File Storage**: Local file system for development, designed to be easily migrated to cloud storage solutions

The schema includes tables for users, rental agreements, and OTP verifications with proper relationships and constraints. Database migrations are managed through Drizzle Kit for version control and deployment consistency.

## Authentication and Authorization
The system implements a multi-layered verification approach:

- **OTP Verification**: Both email and SMS-based verification using Firebase services for secure contact verification
- **Document Verification**: ID proof upload and validation for both tenants and landlords
- **Agreement Verification**: Unique agreement IDs and PDF-based verification for document authenticity

Session management is implemented using connect-pg-simple for PostgreSQL-backed sessions, providing secure user state persistence across requests.

## External Dependencies

### Email Services
- **SendGrid**: Primary email service for sending OTP codes and agreement notifications
- **Fallback**: Console logging for development when SendGrid API keys are not configured

### Firebase Services
- **Firebase Auth**: Phone number verification and email OTP services
- **Development Mode**: Mock OTP generation for development environments

### PDF Processing
- **PDFKit**: Server-side PDF generation for rental agreements with custom formatting and layout
- **Document Templates**: Structured agreement templates with tenant, landlord, and property information

### UI Component Libraries
- **Radix UI**: Accessible component primitives for complex UI interactions
- **Tailwind CSS**: Utility-first CSS framework for consistent styling
- **React Hook Form**: Form state management with Zod validation integration
- **React Dropzone**: File upload handling with drag-and-drop support

### Development Tools
- **Vite**: Development server and build tool with React plugin
- **Replit Integration**: Development environment plugins for cartographer and dev banner
- **TypeScript**: Type safety across frontend and backend with shared schema definitions