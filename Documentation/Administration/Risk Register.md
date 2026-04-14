## Nausicass Climate Grant Risk Register

| Risk ID | Risk Description | Category | Likelihood (1-5) | Impact (1-5) | Risk Rating | Mitigation Strategy | Treatment |
|---------|------------------|----------|------------------|--------------|-------------|---------------------|-----------|
| 1 | Applicant bypasses no-edit rule via API or cache error, leading to inconsistent audit trails. | Technical | 2 | 4 | Med (8) | Implement server-side validation; lock database records upon status change to Submitted. | - |
| 2 | Admin accidental/malicious deletion of a grant type, causing active applications to orphan or fail. | Operational | 2 | 5 | High (10) | Implement Soft Delete logic; require Super-Admin approval for grant removal. | - |
| 3 | Search function reveals sensitive organizational financial data to unauthorized users. | Legal/Compliance | 1 | 5 | Low (5) | Role-Based Access Control (RBAC); encrypt PII at rest. | - |
| 4 | High volume of climate grant submissions crashes the Review dashboard for admins. | Technical | 3 | 4 | High (12) | Load testing; implement pagination and indexed search for Admin Search by Org tool. | - |
| 5 | Dependency/package manager vulnerability introduces security risks into the system. | Technical | 4 | 5 | High (20) | Implement automated vulnerability scanning for dependencies and container images; ensure timely updates of affected packages. | - |
| 6 | Key team member drops out, causing knowledge gaps and potential delivery delays. | Operational | 3 | 4 | High (12) | Maintain clear documentation, enforce knowledge sharing, and ensure task handovers are completed. | - |
| 7 | Security vulnerability exploit in a third-party npm package (Axios supply chain compromise / RAT) risks malicious code being introduced into the frontend build. | Security | 3 | 5 | High (15) | Removed Axios from the frontend in response to the disclosed compromise and replaced it with the native Fetch API; pin dependency versions and lockfile; run npm audit, Snyk and Grype on every PR/image build; generate CycloneDX SBOMs via Syft; review and patch affected packages promptly when CVEs are disclosed. | Mitigated |
