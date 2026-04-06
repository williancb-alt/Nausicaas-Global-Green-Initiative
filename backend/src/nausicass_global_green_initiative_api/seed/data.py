import os
from datetime import datetime, timedelta, timezone

from nausicass_global_green_initiative_api import db
from nausicass_global_green_initiative_api.models.application import Application
from nausicass_global_green_initiative_api.models.audit_log import AuditLog
from nausicass_global_green_initiative_api.models.award import Award
from nausicass_global_green_initiative_api.models.grant import Grant
from nausicass_global_green_initiative_api.models.support_message import SupportMessage
from nausicass_global_green_initiative_api.models.user import User


def _get_seed_password() -> str:
    """
    Extract password to use for all seeded users
    """

    # Check env variable
    password = os.getenv("SEED_PASSWORD", "")

    # If not set, raise error to ensure
    # password is set correctly at runtime
    if not password:
        raise RuntimeError(
            "SEED_PASSWORD environment variable must be set " "to seed the database."
        )

    # If found, return password
    return password


class DatabaseSeeder:
    """
    Seeds the database with sample data for non-prod environments.
    """

    USERS = [
        # Admins
        {"email": "L00196611@atu.ie", "admin": True},
        {"email": "L00196726@atu.ie", "admin": True},
        {"email": "L00203120@atu.ie", "admin": True},
        {"email": "L00203089@atu.ie", "admin": True},
        {"email": "L00203060@atu.ie", "admin": True},
        {"email": "L00188491@atu.ie", "admin": True},
        # Non-Admins
        {"email": "applicant1@example.com", "admin": False},
        {"email": "applicant2@example.com", "admin": False},
        {"email": "applicant3@example.com", "admin": False},
    ]

    GRANTS = [
        {
            "name": "Teto Grant",
            "deadline_offset_days": 90,
            "description": (
                "Studio Ghibli's flagship climate grant providing up to \u20ac10,000 "
                "in funding for climate change initiatives. Open to "
                "both individuals and organisations working on sustainable planet goals."
            ),
            "custom_fields": {
                "fields": [
                    {
                        "name": "funding_amount_eur",
                        "type": "number",
                        "label": "Funding Requested (\u20ac, max 10000)",
                    },
                    {
                        "name": "project_summary",
                        "type": "text",
                        "label": "Project Summary",
                    },
                    {
                        "name": "climate_impact",
                        "type": "text",
                        "label": "Expected Climate Impact",
                    },
                ]
            },
            "hidden": False,
        },
        {
            "name": "Ohmu Reforestation Grant",
            "deadline_offset_days": 120,
            "description": (
                "Supporting reforestation projects that restore "
                "woodland that has been de-forested. Supported "
                "by Studio Ghibli's vision of a "
                "world aligned with nature."
            ),
            "custom_fields": {
                "fields": [
                    {
                        "name": "funding_amount_eur",
                        "type": "number",
                        "label": "Funding Requested (\u20ac)",
                    },
                    {
                        "name": "project_area_hectares",
                        "type": "number",
                        "label": "Project Area (hectares)",
                    },
                    {
                        "name": "tree_species",
                        "type": "text",
                        "label": "Target Tree Species",
                    },
                ]
            },
            "hidden": False,
        },
        {
            "name": "Spirited Away Clean Energy Grant",
            "deadline_offset_days": 150,
            "description": (
                "Funding innovative renewable energy research and development "
                "for rural communities with the aim of advancing Studio Ghibli's "
                "planet goals for a sustainable future."
            ),
            "custom_fields": {
                "fields": [
                    {
                        "name": "funding_amount_eur",
                        "type": "number",
                        "label": "Funding Requested (\u20ac)",
                    },
                    {"name": "energy_type", "type": "text", "label": "Energy Type"},
                    {
                        "name": "expected_output_kw",
                        "type": "number",
                        "label": "Expected Output (kW)",
                    },
                ]
            },
            "hidden": False,
        },
        {
            "name": "Toxic Jungle Ocean Cleanup Grant",
            "deadline_offset_days": 14,
            "description": (
                "Grant targeting reduction of plastic in "
                "oceans to aid pollution cleanup, and "
                "coastal ecosystem restoration. Currently "
                "in draft status, awaiting organisational "
                "approval \u2014 so not yet visible to "
                "applicants."
            ),
            "custom_fields": None,
            "hidden": True,
        },
        {
            "name": "Valley of the Wind Biodiversity Grant",
            "deadline_offset_days": -30,
            "description": (
                "A previous grant that provided funding for "
                "biodiversity conservation projects. "
            ),
            "custom_fields": {
                "fields": [
                    {
                        "name": "funding_amount_eur",
                        "type": "number",
                        "label": "Funding Requested (\u20ac)",
                    },
                    {
                        "name": "species_focus",
                        "type": "text",
                        "label": "Target Species",
                    },
                ]
            },
            "hidden": False,
        },
    ]

    AWARDS = [
        {
            "name": "Nausica\u00e4 Sustainability Award 2026",
            "deadline_offset_days": 90,
            "description": (
                "A special award recognising incredible "
                "contributions towards mitigating the "
                "impacts of climate change, presented by "
                "Nausica\u00e4 Enterprises as part of Studio "
                "Ghibli's sustainable planet goals."
            ),
        },
    ]

    SUPPORT_MESSAGES = [
        {
            "application_index": 0,
            "subject": "Clarification on funding limits",
            "message": (
                "I am just getting in touch to confirm "
                "whether the \u20ac10,000 cap on the Teto "
                "Grant includes VAT, or is the funding "
                "amount non-VAT?"
            ),
            "status": "Replied",
            "admin_response": (
                "The \u20ac10,000 funding cap is inclusive of all taxes. "
            ),
        },
        {
            "application_index": 1,
            "subject": "Request for deadline extension",
            "message": (
                "Our reforestation project requires "
                "permits from the local council before "
                "we can apply. Would it be possible at "
                "all to extend the current deadline by "
                "two weeks to give us more time?"
            ),
            "status": "Open",
            "admin_response": None,
        },
    ]

    APPLICATIONS = [
        {
            "grant_index": 0,
            "status": "pending_review",
            "submitted_offset_days": 0,
            "field_values": {
                "funding_amount_eur": 8500,
                "project_summary": (
                    "Community-led local composting "
                    "programme for three Dublin suburbs"
                ),
                "climate_impact": (
                    "Divert up to 200 tonnes of organic "
                    "waste from landfill a year, reducing "
                    "methane emissions"
                ),
            },
        },
        {
            "grant_index": 1,
            "user_index": 8,
            "status": "in_review",
            "submitted_offset_days": -5,
            "field_values": {
                "funding_amount_eur": 6000,
                "project_area_hectares": 25,
                "tree_species": (
                    "Native Oak, Birch, and Scots Pine "
                    "would be planted to restore a "
                    "biodiverse woodland."
                ),
            },
        },
        {
            "grant_index": 2,
            "user_index": 8,
            "status": "approved",
            "submitted_offset_days": -10,
            "award_index": 0,
            "field_values": {
                "funding_amount_eur": 10000,
                "energy_type": "Solar Microgrids",
                "expected_output_kw": 200,
            },
            "award_justification": (
                "We showed exceptional innovation in deploying "
                "solar microgrids to rural "
                "communities that previously "
                "lacked access to clean energy. "
            ),
            "feedback": (
                "Fantastic proposal with clear milestones "
                "and a detailed community engagement plan, "
                "aligns well with the grant objectives. "
                "Approved for funding."
            ),
        },
        {
            "grant_index": 0,
            "user_index": 7,
            "status": "denied",
            "submitted_offset_days": -15,
            "field_values": {
                "funding_amount_eur": 10000,
                "project_summary": (
                    "Carbon offset certificate " "programme from flights"
                ),
                "climate_impact": (
                    "Offset around 500 tonnes of carbon "
                    "through certificate trading on "
                    "the market"
                ),
            },
            "feedback": (
                "Exact benefits of this approach are "
                "still unclear. Therefore, as difficult "
                "to quantify real environmental impact, "
                "rejecting this application for the "
                "Teto Grant."
            ),
        },
    ]

    AUDIT_LOGS = [
        # Events from grant creation by admin users
        {
            "action": "grant_created",
            "entity_type": "grant",
            "entity_index": ("grants", 0),
            "user_index": 0,
            "offset_days": -60,
            "details": "Created Teto Grant",
        },
        {
            "action": "grant_created",
            "entity_type": "grant",
            "entity_index": ("grants", 1),
            "user_index": 1,
            "offset_days": -55,
            "details": ("Created Ohmu Reforestation Grant"),
        },
        {
            "action": "grant_created",
            "entity_type": "grant",
            "entity_index": ("grants", 2),
            "user_index": 2,
            "offset_days": -50,
            "details": ("Created Spirited Away " "Clean Energy Grant"),
        },
        {
            "action": "grant_created",
            "entity_type": "grant",
            "entity_index": ("grants", 3),
            "user_index": 0,
            "offset_days": -45,
            "details": ("Created Toxic Jungle " "Ocean Cleanup Grant (hidden)"),
        },
        # Events from editing grant by an admin user
        {
            "action": "grant_edited",
            "entity_type": "grant",
            "entity_index": ("grants", 0),
            "user_index": 0,
            "offset_days": -40,
            "details": ("Updated Teto Grant deadline " "and description"),
        },
        # Event from awared creation by admin user
        {
            "action": "award_created",
            "entity_type": "award",
            "entity_index": ("awards", 0),
            "user_index": 0,
            "offset_days": -58,
            "details": ("Created Nausica\u00e4 " "Sustainability Award 2026"),
        },
        # Events from application submissions by applicants
        {
            "action": "application_submitted",
            "entity_type": "application",
            "entity_index": ("applications", 0),
            "user_index": 6,
            "is_admin": False,
            "offset_days": 0,
            "details": ("Application submitted " "for Teto Grant"),
        },
        {
            "action": "application_submitted",
            "entity_type": "application",
            "entity_index": ("applications", 1),
            "user_index": 8,
            "is_admin": False,
            "offset_days": -5,
            "details": ("Application submitted for " "Ohmu Reforestation Grant"),
        },
        {
            "action": "application_submitted",
            "entity_type": "application",
            "entity_index": ("applications", 2),
            "user_index": 8,
            "is_admin": False,
            "offset_days": -10,
            "details": ("Application submitted for " "Spirited Away Clean Energy Grant"),
        },
        {
            "action": "application_submitted",
            "entity_type": "application",
            "entity_index": ("applications", 3),
            "user_index": 7,
            "is_admin": False,
            "offset_days": -15,
            "details": ("Application submitted " "for Teto Grant"),
        },
        # Events from application reviews by admin users,
        # including status changes and feedback
        {
            "action": "application_edited",
            "entity_type": "application",
            "entity_index": ("applications", 2),
            "user_index": 0,
            "offset_days": -3,
            "details": ("Status changed from " "pending_review to approved"),
        },
        {
            "action": "application_edited",
            "entity_type": "application",
            "entity_index": ("applications", 3),
            "user_index": 1,
            "offset_days": -2,
            "details": ("Status changed from " "pending_review to denied"),
        },
        # Event from application edit attempt by applicant user
        # after submission, which is blocked
        {
            "action": "application_edit_blocked",
            "entity_type": "application",
            "entity_index": ("applications", 2),
            "user_index": 8,
            "is_admin": False,
            "offset_days": -1,
            "success": False,
            "failure_reason": ("Applicant cannot edit " "after submission"),
            "details": ("Edit attempt blocked on " "approved application"),
        },
    ]

    def __init__(self):
        # Start with empty lists to be populated as entities are created
        self.users: list[User] = []
        self.admin: User | None = None
        self.applicant: User | None = None
        self.reviewer: User | None = None
        self.grants: list[Grant] = []
        self.awards: list[Award] = []
        self.applications: list[Application] = []
        self.support_messages: list[SupportMessage] = []
        self.audit_logs: list[AuditLog] = []

    @property
    def already_seeded(self) -> bool:
        # Check our emails have user accounts
        # (i.e. already created in previous run)
        admin_emails = [u["email"] for u in self.USERS if u["admin"]]
        return all(User.find_by_email(email) is not None for email in admin_emails)

    def run(self) -> bool:
        """
        Seed the database. Returns True if seeded, False if already seeded.
        """

        # Only seed if empty database (i.e. admin users don't already exist)
        if self.already_seeded:
            return False

        # Use timestamp to ensure that deadlines and submission times are consistent
        # with some in the future and some in the past to reflect a realistic flow
        now = datetime.now(timezone.utc)
        self._create_users()
        self._create_grants(now)
        self._create_awards(now)
        self._create_applications(now)
        self._create_support_messages(now)
        self._create_audit_logs(now)
        db.session.commit()
        return True

    def _create_users(self) -> None:
        # Resolve password at runtime
        password = _get_seed_password()

        new_users = []
        # Loop over the users
        for u in self.USERS:
            # Reuse existing user or create a new one
            existing = User.find_by_email(u["email"])
            if existing:
                self.users.append(existing)
            else:
                user = User(
                    email=u["email"],
                    password=password,
                    admin=u["admin"],
                )
                self.users.append(user)
                new_users.append(user)

        # Only add newly created users to the session
        if new_users:
            db.session.add_all(new_users)
            db.session.flush()

        # Set values that are used across entities for ownership
        self.admin = self.users[0]
        self.applicant = self.users[6]
        self.reviewer = self.users[2]

    def _create_owned_entities(
        self, model: type, definitions: list[dict], now: datetime
    ) -> list:
        """
        Helper function to create grants and awards (as they have a similar structure)
        """

        # Start with empty list
        entities = []

        # Loop over the list
        for d in definitions:
            # Define keyword arguments for model, doing the deadline
            # calculation to ensure it's consistent
            kwargs = {k: v for k, v in d.items() if k != "deadline_offset_days"}
            kwargs["deadline"] = now + timedelta(days=d["deadline_offset_days"])
            kwargs["owner"] = self.admin
            entities.append(model(**kwargs))

        # Add all in one call
        db.session.add_all(entities)
        db.session.flush()

        # Return the full list at the end
        # (so it can be referenced elsewhere)
        return entities

    def _create_grants(self, now: datetime) -> None:
        # Call the helper function to create the grants
        # and assign the class grants variable with the values
        self.grants = self._create_owned_entities(Grant, self.GRANTS, now)

    def _create_awards(self, now: datetime) -> None:
        # Call the helper function to create awards
        # and assign the class awards variable with the values
        self.awards = self._create_owned_entities(Award, self.AWARDS, now)

    def _create_applications(self, now: datetime) -> None:
        # Loop over the defined applications further up the file
        for app_data in self.APPLICATIONS:
            # Default to the first non-admin user
            # if no user index provided
            user = self.users[app_data.get("user_index", 6)]

            # Resolve optional award link
            award_index = app_data.get("award_index")
            award = self.awards[award_index] if award_index is not None else None

            # Create instance of application
            application = Application(
                submitted_at=now + timedelta(days=app_data["submitted_offset_days"]),
                status=app_data["status"],
                field_values=app_data["field_values"],
                feedback=app_data.get("feedback"),
                award_justification=app_data.get("award_justification"),
                user=user,
                grant=self.grants[app_data["grant_index"]],
                award=award,
            )
            self.applications.append(application)

        # Add all applications in one call at the end
        db.session.add_all(self.applications)
        db.session.flush()

    def _create_support_messages(self, now: datetime) -> None:
        # Loop over the defined support messages further up the file
        for sm_data in self.SUPPORT_MESSAGES:
            # Create instance of support message,
            # linking to the applicant user and
            # the relevant application
            answered_at = now if sm_data["status"] == "Replied" else None
            message = SupportMessage(
                subject=sm_data["subject"],
                message=sm_data["message"],
                status=sm_data["status"],
                admin_response=sm_data["admin_response"],
                answered_at=answered_at,
                user=self.applicant,
                application=self.applications[sm_data["application_index"]],
            )
            self.support_messages.append(message)

        # Add all support messages in one call at the end
        db.session.add_all(self.support_messages)

    def _create_audit_logs(self, now: datetime) -> None:
        # Loop over defined audit log entries
        for log_data in self.AUDIT_LOGS:
            # Resolve entity reference
            collection_name, idx = log_data["entity_index"]
            collection = getattr(self, collection_name)
            entity = collection[idx]

            user = self.users[log_data["user_index"]]
            is_admin = log_data.get("is_admin", True)

            # Create AuditLog instance for each entry
            entry = AuditLog(
                timestamp=now + timedelta(days=log_data["offset_days"]),
                user_id=user.id,
                user_email=user.email,
                is_admin=is_admin,
                action=log_data["action"],
                entity_type=log_data["entity_type"],
                entity_id=entity.id,
                details=log_data.get("details"),
                ip_address="127.0.0.1",
                user_agent="Seed/1.0",
                success=log_data.get("success", True),
                failure_reason=log_data.get("failure_reason"),
            )
            self.audit_logs.append(entry)

        # Add all audit log entries in one call
        db.session.add_all(self.audit_logs)


def run_seed() -> dict | None:
    """
    This function is called to seed the database with initial dummy data.
    Returns None if already seeded or blocked by production env.
    """
    flask_env = os.getenv("FLASK_ENV", "development")
    if flask_env == "production":
        return None

    # Initialise the database seeder class
    seeder = DatabaseSeeder()

    # If this returns False, it means database
    # has already been seeded
    if not seeder.run():
        return None

    # Return summary of what was seeded
    # which can be printed in CLI output
    # for full visibility
    return {
        "users": seeder.USERS,
        "grants": len(seeder.grants),
        "awards": len(seeder.awards),
        "applications": len(seeder.applications),
        "support_messages": len(seeder.support_messages),
        "audit_logs": len(seeder.audit_logs),
    }
