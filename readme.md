# Nausicaä's Global Green Initiative

An online grant application platform for Studio Ghibli's climate change initiatives, supporting their Sustainable Planet Goals. The platform allows for the administration and creation of multiple grants, including the ability to create and manage special award applications. Applicant users can monitor their approval status, view thier applications and apply to available grants using a seperate interface from administrative staff. 



> For setup instructions, see the [Quickstart Guide](./QUICKSTART.md).

## Table of Contents

- [Tech Stack](#tech-stack)
- [Product Owner](#product-owner)
- [Team](#team)
- [Scrum Master Rotation](#scrum-master-rotation)
- [Project Deadline](#project-deadline)
- [Requirements](#requirements)
- [Deliverables](#deliverables)
- [Risk Register](#risk-register)
- [Environments](#environments)
- [Security](#security)
- [Testing](#testing)
- [Branching Strategy & Version Control](#branching-strategy--version-control)
- [Useful Links](#useful-links)
- [Social Contract](#social-contract)
- [Meetings](#meetings)
- [Communication](#communication)
- [Agile Way of Working](#agile-way-of-working)
- [Estimating Story Points](#estimating-story-points)
- [Definition of Ready](#definition-of-ready)
- [Definition of Done](#definition-of-done)

## Tech Stack

### Frontend

| Technology | Version |
|-----------|---------|
| React | >= 19.0.0 |
| TypeScript | >= 5.7.3 |
| Vite | >= 6.1.0 |
| Bootstrap | >= 5.3.8 |
| React Router DOM | >= 7.8.2 |
| Axios | >= 1.13.2 |
| React Hook Form | >= 7.69.0 |
| Zod (validation) | >= 4.3.4 |
| Zustand (client state) | >= 5.0.9 |
| TanStack React Query (server state) | >= 5.90.16 |

### Backend

| Technology | Version |
|-----------|---------|
| Python | 3.13 |
| Flask | >= 3.1.0 |
| Flask-RESTx (Swagger UI) | latest |
| Flask-SQLAlchemy | >= 3.1.0 |
| Flask-Migrate (Alembic) | latest |
| Gunicorn | latest |
| PyJWT | latest |
| Flask-Bcrypt | latest |
| Authlib (Google, GitHub OAuth) | latest |
| PostgreSQL | 16 |

### Testing and Code Quality

| Technology | Version |
|-----------|---------|
| pytest / tox (backend) | latest |
| Vitest (frontend) | >= 3.0.5 |
| Playwright (E2E) | >= 1.58.0 |
| Black (Python formatting) | >= 25.1.0 |
| Flake8 (Python linting) | latest |
| ESLint | >= 9.19.0 |
| Prettier | >= 3.5.1 |
| CodeScene (code health) | — |
| Snyk (vulnerability scanning) | — |
| Safety (Python package security) | — |

### Infrastructure and CI/CD

| Technology | Version |
|-----------|---------|
| Docker, Docker Compose | dev and test profiles |
| Node (frontend build image) | 24-alpine |
| Nginx (frontend runtime image) | stable-alpine |
| Python (backend image) | 3.13-slim |
| Microsoft Azure | AKS, ACR, Key Vault, PostgreSQL Flexible Server |
| Terraform | 1.6.2 (requires >= 1.5.0) |
| AzureRM provider | >= 3.116.0 |
| Kubernetes provider | >= 2.30 |
| Helm provider | >= 2.13 |
| Cloudflare provider | >= 4.0 |
| GitHub Actions | 9 workflows |
| Cloudflare DNS, cert-manager, ESO | — |

### Project Management

| Tool |
|------|
| GitHub Projects |
| Pointing Poker (story point estimation) |
| EasyRetro (sprint retrospectives) |

## Product Owner

Pauric Dawson (Permanent)

## Superstar

*To be discussed*

## Team

| Name | Responsibilities / Work Completed |
|------|-----------------------------------|
| Arno Moelich | *To be filled* |
| Matheus Maximo De Araujo | *To be filled* |
| John Dennehy | *To be filled* |
| Willian Belolli | *To be filled* |
| Tito Etimiri | *To be filled* |
| Ronan O'Dea | *To be filled* |

> **Note:** Anuj Kumar was a member of the team but has since left the project. He contributed towards scaffolding the IaC deployment.

## Scrum Master Rotation

Rotating scrum master so that everyone gets to experience the role once.

| Week | Scrum Master |
|------|-------------|
| 08/12 | Arno |
| 15/12 | Matheus |
| 22/12 - 05/01 | BREAK |
| 12/01 | John |
| 19/01 | Tito |
| 26/01 | Willian |
| 02/02 | Anuj |
| 09/02 | Ronan |
| 16/02 | Arno |
| 23/02 | Matheus |
| 02/03 | John |
| 09/03 | Tito |
| 16/03 | Willian |
| 23/03 | Ronan |
| 30/03 - 06/04 | BREAK |

## Project Deadline

14/04/2026

## Requirements

- Capture applicant details, funding requests, and grant selection. (Ronan)
- Include an optional field for special award applications. (Matheus)
- Applicants can submit but not modify their data after submission. (Arno)
- Administrators (Nausicaä Enterprises) can view, edit, and manage all applications. (John / Willian)
- Interface must be clean, user-friendly, and secure. (Tito)

## Deliverables

- Full SDLC pipeline setup for development, testing, and deployment.
- Basic UI prototype page(s) for pipeline validation.
- Compliance with standard security requirements and data protection practices.

## Risk Register

These are the current risks on the project, re-aligned on a weekly basis. Full register available at [Administration/Risk Register.md](./Documentation/Administration/Risk%20Register.md).

*This risk register needs to be reviewed and updated.*

| Risk ID | Risk Description | Category | Likelihood (1-5) | Impact (1-5) | Risk Rating | Mitigation Strategy |
|---------|------------------|----------|------------------|--------------|-------------|---------------------|
| 1 | Applicant bypasses no-edit rule via API or cache error, leading to inconsistent audit trails. | Technical | 2 | 4 | Med (8) | Implement server-side validation; lock database records upon status change to Submitted. |
| 2 | Admin accidental/malicious deletion of a grant type, causing active applications to orphan or fail. | Operational | 2 | 5 | High (10) | Implement Soft Delete logic; require Super-Admin approval for grant removal. |
| 3 | Search function reveals sensitive organizational financial data to unauthorized users. | Legal/Compliance | 1 | 5 | Low (5) | Role-Based Access Control (RBAC); encrypt PII at rest. |
| 4 | High volume of climate grant submissions crashes the Review dashboard for admins. | Technical | 3 | 4 | High (12) | Load testing; implement pagination and indexed search for Admin Search by Org tool. |

## Environments

| Environment | Frontend | API / Swagger |
|-------------|----------|---------------|
| Local (dev) | http://localhost:5173 | http://localhost:8080/api/v1/ui |
| Staging | https://ui-staging.nausicaaglobalgreeninitiative.ie | https://api-staging.nausicaaglobalgreeninitiative.ie/api/v1/ui |
| Production | https://ui.nausicaaglobalgreeninitiative.ie | https://api.nausicaaglobalgreeninitiative.ie/api/v1/ui |

- **Staging** auto-deploys on merge to `main` (gated by CI and E2E tests). Torn down nightly at 01:00 UTC for cost optimisation.
- **Production** deploys are manual, triggered by a git tag (e.g. `v1.2.3`) and require environment approval.

See [Infrastructure README](./infrastructure/README.md) for full details on the 3-layer Terraform setup and CI/CD pipelines.

## Security

- **Authentication:** JWT tokens with configurable expiry, password hashing via Bcrypt
- **OAuth:** Google and GitHub login via Authlib
- **Authorisation:** Role-Based Access Control (RBAC) - admin and regular user roles
- **Vulnerability Scanning:** Snyk (dependency vulnerabilities), Safety (Python package security)
- **Code Analysis:** CodeScene (code health, complexity, nesting)
- **Infrastructure:** Azure Key Vault for secrets, External Secrets Operator for Kubernetes, OIDC-based Azure login in CI/CD
- **Audit Trail:** All admin actions logged via audit log system

## Testing

| Layer | Framework | What it covers | How to run |
|-------|-----------|---------------|------------|
| Backend unit/integration | pytest + tox | API endpoints, models, services (80% coverage gate) | `docker compose --profile dev exec backend python -m tox` |
| Backend linting | Black + Flake8 | Code formatting and style | `docker compose --profile dev exec backend python -m black --check src tests run.py` |
| Frontend unit | Vitest + Testing Library | React components and hooks | `cd frontend && npm test` |
| Frontend linting | ESLint + Prettier | Code quality and formatting | `cd frontend && npm run lint` |
| E2E | Playwright (Chromium) | Full user flows against running app | `docker compose --profile test up -d --build && cd e2e && npx playwright test` |

## Branching Strategy & Version Control

- **Main branch:** `main` (protected, requires PR with at least one approval)
- **Feature branches:** Created from `main`, named descriptively
- **PR policy:** One approval required to merge. Authors may tag domain experts for complex changes.
- **Merging to `main`:** Triggers staging CI/CD pipeline automatically
- **Releases:** Semantic versioning via git tags (e.g. `v1.2.3`), which triggers production deployment
- **Version management:** `backend/setup.py` and `frontend/package.json` updated by release workflow

## Useful Links

- Project Slack: https://atudevops.slack.com
- GitHub: https://github.com/williancb-alt/Nausicaas-Global-Green-Initiative.git
- Figma: https://www.figma.com/files/team/1581042243514154421/project/515037871/Team-project?fuid=1581042238894889205
- Pointing Poker: https://www.pointingpoker.com/
- EasyRetro: https://easyretro.io/

## Further Documentation

| Section | Description | Location |
|---------|-------------|----------|
| Quickstart Guide | Getting the app running locally | [QUICKSTART.md](./QUICKSTART.md) |
| Backend API | Flask API details, manual setup | [backend/README.md](./backend/README.md) |
| Frontend App | React app details, manual setup | [frontend/README.md](./frontend/README.md) |
| Infrastructure | Terraform, Azure/AKS, CI/CD, deployments | [infrastructure/README.md](./infrastructure/README.md) |
| Risk Register | Full risk register with mitigations | [Administration/Risk Register.md](./Documentation/Administration/Risk%20Register.md) |
| Meeting Minutes | Sprint meeting notes | [Administration/Minutes/](./Documentation/Administration/Minutes/) |
| Sprint Planning | Story point estimation records | [Administration/Sprint_Poker_Planning/](./Documentation/Administration/Sprint_Poker_Planning/) |

## Social Contract

- Mobile phones be left on silent during sprint sessions and class time.
- Be on time for team meetings and class, if you are running late let the group know by sending a message into the Slack channel.
- Everyone has an equal voice and valuable contribution.
- When you are assigned a job, take ownership of it and keep it up to date, do not be afraid to ask others for help, always be honest about your work.
- Do not speak over someone when they are expressing a point; everyone has an equal voice.
- No blame culture.
- Do not be afraid to ask for help; we are all learning.
- No invisible work.
- Ask questions to make sure you understand the task given to you.
- Try to have some fun; teamwork makes the dream work.
- Use Agile methodologies in the project at all times.

## Meetings

Stand-ups will occur **Every Tuesday at 20:30** during class and **Thursdays at 19:00**. Two per week.

Updates will be in the form: What I've done, Impediments, What I plan to do.

Sprint planning will occur at **Every Thursday at 19:15** every week.
Please add and update items within **GitHub Projects** prior to the sprint planning session.

Sprint retro will be at the end of our sprint on **Thursdays at 19:30** (timebox retro for 15 minutes, to be organised by the scrum master).
Points raised in the sprint retro will be captured and posted on the Team's meeting channel by the Scrum Master. The Scrum Master is rotated per team member every week.

Come prepared for meetings.
Be on time for stand-ups and meetings.
Mobile phones are on silent.
Everyone has an equal voice and valuable contribution.
Keep your language and tone professional at all times.
Be honest.

## Communication

Slack is the preferred method of communication.

Communication in this order: Slack, Microsoft Teams, E-Mail.

- If a demonstration is required, use Zoom, record the session and upload it to the Slack channel.
- No Slack communications between 22:00 and 08:00.
- Raise a problem as soon as you see it.
- Respect each other and understand differences in knowledge.
- All team documents are to be created using Markdown language and shared on GitHub.
- There are no silly questions; if you don't understand, ask.
- Share success stories.
- Focus on the positives.
- Don't make assumptions.
- Don't interrupt and cut another person off while they are talking.
- Listen when someone is talking; don't interject.
- Zero tolerance for bullying.

## Agile Way of Working

- If you are assigned a job, take ownership of it and keep it up to date.
- Stick to your agreed working patterns. Let the team know when you are late or going early.
- Keep the Kanban board updated at all times.
- Update the Kanban Board as you progress the story i.e. don't update at standup.
- Don't be afraid to ask for help.
- Don't be afraid to give constructive criticism, as long as it is constructive.
- Solve roadblocks within the team. If the impediment can't be solved within the team, then give it to the Scrum Master.
- Sprints will start after the stand-up that happens at the start of class each week.
- The Scrum Master role rotates each week, and the schedule is available above.
- Each member of the team will work approximately 3 hours per week unless they are on vacation.

## Estimating Story Points

Story point estimation is done using poker planning games such as: [Pointing Poker](https://www.pointingpoker.com/) during sprint planning sessions.

Sizing scale:
- 1 (XS)
- 2 (S)
- 3 (M)
- 4 (L)
- 5 (XL)

## Definition of Ready

- User story is clearly written with acceptance criteria
- Dependencies are identified
- Story has been estimated by the team
- Story is small enough to be completed within one sprint

## Definition of Done

- Code is written and pushed to a feature branch
- PR created with at least one approval
- All CI checks pass (linting, tests, security scans)
- Code has been merged to main
- Application is deployed, accessible, and interactive on Azure via IaC
