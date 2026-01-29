# To Do

## User Features

- [ ] **Landing page for users**
  - Create dedicated user landing page (separate from admin view)
  - Display available grants to apply for

- [ ] **Grant application functionality**
  - Add "Apply" button to grants displayed to users
  - Create application form that renders grant's custom fields
  - Route application data to database

- [ ] **View submitted applications**
  - Users can view their previously submitted applications
  - Applications are read-only (no editing after submission)

## Admin Features

- [ ] **Edit grant functionality**
  - Implement edit modal/form for existing grants
  - Allow modification of grant details and custom fields

- [ ] **View applications from landing page**
  - Admin can view all applications for each grant
  - Display applicant information and submitted field values

## Data & Validation

- [ ] **Data routing to database**
  - Create Application model in backend
  - Set up API endpoints for application CRUD operations
  - Link applications to grants and users

- [ ] **Required option for custom fields**
  - Add "required" checkbox when creating custom fields
  - Store required flag in field configuration
  - Enforce required validation on application submission

- [ ] **Enforce data mutability and validation**
  - Prevent editing of submitted applications
  - Server-side validation for all custom field types
  - Validate required fields before submission
  - Ensure data integrity constraints in database
