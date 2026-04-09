## Nausicass Climate Grant Risk Register

| Risk ID | Risk Description | Category | Likelihood (1-5) | Impact (1-5) | Risk Rating | Mitigation Strategy | Treatment | Owner |
|---------|------------------|----------|------------------|--------------|-------------|---------------------|-----------|-------|
| 1 | Applicant bypasses no-edit rule via API or cache error, leading to inconsistent audit trails. | Technical | 2 | 4 | Med (8) | Implement server-side validation; lock database records upon status change to Submitted. | - | - [file:1] |
| 2 | Admin accidental/malicious deletion of a grant type, causing active applications to orphan or fail. | Operational | 2 | 5 | High (10) | Implement Soft Delete logic; require Super-Admin approval for grant removal. | - | - [file:1] |
| 3 | Search function reveals sensitive organizational financial data to unauthorized users. | Legal/Compliance | 1 | 5 | Low (5) | Role-Based Access Control (RBAC); encrypt PII (Personally Identifiable Information) at rest. | - | - [file:1] |
| 4 | High volume of climate grant submissions crashes the Review dashboard for admins. | Technical | 3 | 4 | High (12) | Load testing; implement pagination and indexed search for Admin Search by Org tool. | - | - [file:1] |
| 5 | Dependency/package manager vulnerability introduces security risks into the system | Technical | 4 | 5 | High (20) | Implement automated vulnerability scanning for dependencies and container images; ensure timely updates of affected packages. | - | - [file:1] |
| 6 | Key team member drops out, causing knowledge gaps and potential delivery delays | Operational | 3 | 4 | High (12) | Maintain clear documentation, enforce knowledge sharing, and ensure task handovers are completed. | - | - [file:1] |
