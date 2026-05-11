# CyberShield Document Management System (DMS) Integration Plan

This plan outlines the technical steps required to implement the Document Cycle System inside the CyberShield Academy platform. It defines the database architecture, API endpoints, and UI components needed to support dynamic document workflows, approvals, and archiving.

## User Review Required

> [!IMPORTANT]
> The database changes will require a Prisma migration. I will need your approval to modify `schema.prisma` and execute `npx prisma db push` or `npx prisma migrate dev`.
> Please also confirm if you prefer generating physical PDF files on the server (using a library like `pdf-lib` or `react-pdf`) or simply treating documents as structured JSON records with a UI that "looks" like a document.

## Proposed Changes

---

### Database Schema (Prisma)

We will introduce new models to support a generic, scalable Document Management System (DMS).

#### [MODIFY] [schema.prisma](file:///d:/new/cyber-chell/prisma/schema.prisma)

Add the following new models to handle document templates, submissions, and workflow tracking:

```prisma
// --- Document Management System Models ---

model DocumentTemplate {
  id          String   @id @default(cuid())
  code        String   @unique // e.g., 'INS-01', 'CRS-01'
  titleAr     String
  titleEn     String
  schema      String   // JSON representing the form fields
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  
  documents   Document[]
}

model Document {
  id           String   @id @default(cuid())
  serialNumber String   @unique // e.g., 'DOC-2026-001'
  templateId   String
  template     DocumentTemplate @relation(fields: [templateId], references: [id])
  submitterId  String
  submitter    User     @relation("SubmittedDocuments", fields: [submitterId], references: [id])
  reviewerId   String?
  reviewer     User?    @relation("ReviewedDocuments", fields: [reviewerId], references: [id])
  
  status       String   @default("PENDING") // PENDING, APPROVED, REJECTED, ARCHIVED
  data         String   // JSON storing the filled form data
  signature    String?  // Digital signature hash
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  logs         DocumentLog[]
  
  @@map("documents")
}

model DocumentLog {
  id           String   @id @default(cuid())
  documentId   String
  document     Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  action       String   // CREATED, REVIEWED, APPROVED, REJECTED
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  notes        String?
  createdAt    DateTime @default(now())
  
  @@map("document_logs")
}
```
*(Also, add the relation fields `submittedDocuments`, `reviewedDocuments`, and `documentLogs` to the existing `User` model).*

---

### Backend API Routes

We will create a centralized API for handling the document lifecycle.

#### [NEW] `src/app/api/documents/route.ts`
- `GET`: Fetch documents (with filtering by status, template, submitter).
- `POST`: Submit a new document (validates JSON payload against template schema).

#### [NEW] `src/app/api/documents/[id]/route.ts`
- `GET`: Fetch a specific document by ID.
- `PATCH`: Update document status (Approve/Reject) and append a `DocumentLog`.

#### [NEW] `src/app/api/documents/templates/route.ts`
- `GET`: Fetch available document templates (e.g., `INS-01`, `CRS-01`) to render forms dynamically on the frontend.

---

### Frontend UI Components

We will build dynamic forms and a management dashboard.

#### [NEW] `src/components/documents/DocumentForm.tsx`
- A dynamic React component that takes a `DocumentTemplate` JSON schema and renders the corresponding input fields, handling validation and submission.

#### [NEW] `src/components/documents/DocumentViewer.tsx`
- A read-only view that formats the submitted JSON data into a professional "A4 Document" look using Tailwind CSS. Includes print/export to PDF functionality using browser print APIs.

#### [NEW] `src/app/(admin)/dashboard/documents/page.tsx`
- The Admin Document Control Center. A data table displaying all pending, approved, and rejected documents. Admins can click on a document to review it, add notes, and approve/reject.

#### [NEW] `src/app/(public)/dashboard/instructor/documents/page.tsx`
- The Instructor Document portal, where instructors can submit `CRS-01` (Course Proposals) or view their contracts (`INS-03`).

---

## Verification Plan

### Automated/Manual Testing
- **Database Validation**: Run Prisma studio to manually verify the new models and relationships.
- **API Testing**: Use standard HTTP requests or the Next.js frontend to verify that submitting an `INS-01` request successfully inserts a `Document` and `DocumentLog`.
- **Workflow Simulation**:
  1. Log in as an Instructor and submit a Course Proposal (`CRS-01`).
  2. Log in as an Admin, navigate to the Document Dashboard, and approve the document.
  3. Verify that the document status updates to `APPROVED` and the digital signature/approval log is recorded.
