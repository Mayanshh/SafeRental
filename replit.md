# Overview

SafeRental is a comprehensive web application for creating, managing, and verifying legally compliant rental agreements. The platform facilitates secure transactions between tenants and landlords by providing built-in verification features, document generation, and multi-layer authentication. The system allows tenants to create rental agreements through a step-by-step form process, while landlords can verify and approve these agreements through OTP-based verification systems.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built using React 18 with TypeScript, implementing a modern component-based architecture. The application uses Vite as the build tool and development server for fast hot module replacement and optimized builds. The UI framework is based on shadcn/ui components built on top of Radix UI primitives, providing accessible and customizable components.

Key architectural decisions include:
- **State Management**: React Query (TanStack Query) for server state management, providing automatic caching, background updates, and optimistic updates
- **Routing**: Wouter for lightweight client-side routing without the complexity of React Router
- **Styling**: Tailwind CSS with CSS custom properties for theming, using a design system approach
- **Form Handling**: React Hook Form with Zod validation for type-safe form validation and submission
- **File Uploads**: React Dropzone for drag-and-drop file upload functionality

The application follows a multi-step form pattern for agreement creation, with progressive validation and file upload capabilities for identity verification documents.

## Backend Architecture

The backend implements a REST API architecture using Express.js with TypeScript. The server follows a layered architecture pattern with clear separation of concerns:

- **Route Layer**: Handles HTTP requests/responses, input validation using Zod schemas, and file upload processing with Multer
- **Service Layer**: Contains business logic for email delivery (SendGrid), PDF generation (PDFKit), and Firebase authentication services
- **Storage Layer**: Database abstraction layer with MongoDB implementation using native driver
- **Middleware**: Centralized error handling, request logging, and CORS configuration

The API supports multipart form data for file uploads with proper validation for file types (images and PDFs) and size limits. Session management is implemented for user state persistence.

## Data Storage Solutions

The application uses MongoDB as the primary database with a document-based schema design:

- **Collections**: Users, agreements, OTP verifications, and counters for atomic sequence generation
- **Indexing Strategy**: Optimized indexes for agreement lookups by number, email searches, and TTL indexes for OTP expiration
- **File Storage**: Local filesystem for development with structured upload directory organization
- **Database Connection**: Connection pooling and error handling with automatic reconnection

The schema design accommodates both tenant and landlord information within agreement documents, with separate verification status tracking and PDF URL storage for generated documents.

## Authentication and Authorization

The system implements a multi-layer verification approach combining several authentication mechanisms:

- **OTP Verification**: Dual-channel verification using both email and SMS through Firebase services
- **Document Verification**: Identity proof upload and validation for both parties
- **Agreement Verification**: Unique agreement number generation with year-based sequencing
- **Session Management**: Server-side session storage for user state persistence

The verification process ensures both parties complete identity verification before agreement activation, with separate verification status tracking for tenants and landlords.

# External Dependencies

## Database Services
- **MongoDB Atlas**: Primary database for production deployment with connection string configuration
- **Local Development**: In-memory fallback for development environments

## Email Services
- **SendGrid**: Primary email service for OTP delivery and agreement notifications with API key authentication
- **Development Fallback**: Console logging when SendGrid credentials are not configured

## Firebase Services
- **Firebase Authentication**: Phone number verification and email OTP services for multi-factor authentication
- **Configuration**: Environment-based Firebase project configuration with API keys

## File Processing
- **PDFKit**: Server-side PDF generation for rental agreements with custom formatting and styling
- **Multer**: File upload handling with configurable storage destinations and file type validation

## UI Component Libraries
- **Radix UI**: Accessible component primitives for dropdown menus, dialogs, and form controls
- **shadcn/ui**: Pre-built component library with consistent design system
- **Lucide React**: Icon library for consistent iconography throughout the application