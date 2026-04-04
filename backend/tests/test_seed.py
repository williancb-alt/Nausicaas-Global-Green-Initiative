import pytest
from flask_sqlalchemy import SQLAlchemy

from nausicass_global_green_initiative_api.models.user import User
from nausicass_global_green_initiative_api.seed.data import DatabaseSeeder


class TestDatabaseSeeder:
    """
    Tests for the DatabaseSeeder class.
    """

    @pytest.fixture(autouse=True)
    def setup(self, db: SQLAlchemy):
        self.db = db
        self.seeder = DatabaseSeeder()

    def test_seed_creates_all_users(self):
        self.seeder.run()

        assert len(self.seeder.users) == len(DatabaseSeeder.USERS)
        for seed_user, user in zip(DatabaseSeeder.USERS, self.seeder.users):
            assert user.email == seed_user["email"]
            assert user.admin == seed_user["admin"]

    def test_seed_creates_admin_users(self):
        self.seeder.run()

        admin_emails = {u["email"] for u in DatabaseSeeder.USERS if u["admin"]}
        for user in self.seeder.users:
            if user.email in admin_emails:
                assert user.admin is True

    def test_seed_creates_non_admin_users(self):
        self.seeder.run()

        non_admin_emails = {u["email"] for u in DatabaseSeeder.USERS if not u["admin"]}
        for user in self.seeder.users:
            if user.email in non_admin_emails:
                assert user.admin is False

    def test_seed_users_can_authenticate(self):
        self.seeder.run()

        for seed_user in DatabaseSeeder.USERS:
            user = User.find_by_email(seed_user["email"])
            assert user is not None
            assert user.check_password(seed_user["password"])

    def test_seed_creates_all_grants(self):
        self.seeder.run()

        assert len(self.seeder.grants) == len(DatabaseSeeder.GRANTS)
        for seed_grant, grant in zip(DatabaseSeeder.GRANTS, self.seeder.grants):
            assert grant.name == seed_grant["name"]
            assert grant.description == seed_grant["description"]
            assert grant.hidden == seed_grant["hidden"]
            assert grant.custom_fields == seed_grant["custom_fields"]

    def test_seed_grants_owned_by_admin(self):
        self.seeder.run()

        for grant in self.seeder.grants:
            assert grant.owner_id == self.seeder.admin.id

    def test_seed_grants_have_expected_deadlines(self):
        self.seeder.run()

        past = [g for g in self.seeder.grants if g.deadline_passed]
        future = [g for g in self.seeder.grants if not g.deadline_passed]
        assert len(past) >= 1
        assert len(future) >= 1

    def test_seed_creates_hidden_and_visible_grants(self):
        self.seeder.run()

        hidden = [g for g in self.seeder.grants if g.hidden]
        visible = [g for g in self.seeder.grants if not g.hidden]
        assert len(hidden) >= 1
        assert len(visible) >= 1

    def test_seed_creates_all_awards(self):
        self.seeder.run()

        assert len(self.seeder.awards) == len(DatabaseSeeder.AWARDS)
        for seed_award, award in zip(DatabaseSeeder.AWARDS, self.seeder.awards):
            assert award.name == seed_award["name"]
            assert award.description == seed_award["description"]

    def test_seed_awards_owned_by_admin(self):
        self.seeder.run()

        for award in self.seeder.awards:
            assert award.owner_id == self.seeder.admin.id

    def test_seed_creates_all_applications(self):
        self.seeder.run()

        assert len(self.seeder.applications) == len(DatabaseSeeder.APPLICATIONS)

    def test_seed_applications_cover_all_statuses(self):
        self.seeder.run()

        statuses = {app.status for app in self.seeder.applications}
        assert statuses == {"pending_review", "in_review", "approved", "denied"}

    def test_seed_applications_linked_to_grants(self):
        self.seeder.run()

        for app in self.seeder.applications:
            assert app.grant_id is not None
            assert app.grant in self.seeder.grants

    def test_seed_applications_linked_to_users(self):
        self.seeder.run()

        for app in self.seeder.applications:
            assert app.user_id is not None
            assert app.user in self.seeder.users

    def test_seed_denied_application_has_feedback(self):
        self.seeder.run()

        denied = [a for a in self.seeder.applications if a.status == "denied"]
        assert len(denied) >= 1
        for app in denied:
            assert app.feedback is not None

    def test_seed_approved_application_has_feedback(self):
        self.seeder.run()

        approved = [a for a in self.seeder.applications if a.status == "approved"]
        assert len(approved) >= 1
        for app in approved:
            assert app.feedback is not None

    def test_seed_creates_all_support_messages(self):
        self.seeder.run()

        assert len(self.seeder.support_messages) == len(DatabaseSeeder.SUPPORT_MESSAGES)

    def test_seed_support_messages_cover_all_statuses(self):
        self.seeder.run()

        statuses = {sm.status for sm in self.seeder.support_messages}
        assert statuses == {"Open", "Replied"}

    def test_seed_replied_message_has_response_and_timestamp(self):
        self.seeder.run()

        replied = [sm for sm in self.seeder.support_messages if sm.status == "Replied"]
        assert len(replied) >= 1
        for sm in replied:
            assert sm.admin_response is not None
            assert sm.answered_at is not None

    def test_seed_open_message_has_no_response(self):
        self.seeder.run()

        open_msgs = [sm for sm in self.seeder.support_messages if sm.status == "Open"]
        assert len(open_msgs) >= 1
        for sm in open_msgs:
            assert sm.admin_response is None
            assert sm.answered_at is None

    def test_seed_support_messages_linked_to_applications(self):
        self.seeder.run()

        for sm in self.seeder.support_messages:
            assert sm.application_id is not None
            assert sm.application in self.seeder.applications

    def test_seed_creates_all_audit_logs(self):
        self.seeder.run()

        assert len(self.seeder.audit_logs) == len(DatabaseSeeder.AUDIT_LOGS)

    def test_seed_audit_logs_cover_action_types(self):
        self.seeder.run()

        actions = {log.action for log in self.seeder.audit_logs}
        assert "grant_created" in actions
        assert "grant_edited" in actions
        assert "award_created" in actions
        assert "application_submitted" in actions
        assert "application_edited" in actions
        assert "application_edit_blocked" in actions

    def test_seed_audit_logs_include_failed_attempt(self):
        self.seeder.run()

        failed = [log for log in self.seeder.audit_logs if not log.success]
        assert len(failed) >= 1
        for log in failed:
            assert log.failure_reason is not None

    def test_seed_audit_logs_linked_to_entities(self):
        self.seeder.run()

        for log in self.seeder.audit_logs:
            assert log.entity_type is not None
            assert log.entity_id is not None
            assert log.user_id is not None

    def test_seed_is_idempotent(self):
        assert self.seeder.run() is True
        assert self.seeder.already_seeded is True

        second_seeder = DatabaseSeeder()
        assert second_seeder.run() is False

        assert User.query.count() == len(DatabaseSeeder.USERS)

    def test_seed_already_seeded_partial(self):
        """If only some admin users exist, seed should still run."""
        first_admin = DatabaseSeeder.USERS[0]
        user = User(
            email=first_admin["email"],
            password=first_admin["password"],
            admin=first_admin["admin"],
        )
        self.db.session.add(user)
        self.db.session.commit()

        seeder = DatabaseSeeder()
        assert seeder.already_seeded is False


class TestRunSeed:
    """
    Tests for the run_seed function.
    """

    @pytest.fixture(autouse=True)
    def setup(self, db: SQLAlchemy):
        self.db = db

    def test_run_seed_returns_summary(self):
        from nausicass_global_green_initiative_api.seed import run_seed

        result = run_seed()

        assert result is not None
        assert "users" in result
        assert "grants" in result
        assert "awards" in result
        assert "applications" in result
        assert "support_messages" in result
        assert result["grants"] == len(DatabaseSeeder.GRANTS)
        assert result["awards"] == len(DatabaseSeeder.AWARDS)
        assert result["applications"] == len(DatabaseSeeder.APPLICATIONS)
        assert result["support_messages"] == len(DatabaseSeeder.SUPPORT_MESSAGES)
        assert result["audit_logs"] == len(DatabaseSeeder.AUDIT_LOGS)

    def test_run_seed_returns_none_when_already_seeded(self):
        from nausicass_global_green_initiative_api.seed import run_seed

        run_seed()
        result = run_seed()

        assert result is None


class TestSeedDbCommand:
    """
    Tests for the flask seed-db CLI command.
    """

    @pytest.fixture(autouse=True)
    def setup(self, app, db: SQLAlchemy):
        self.app = app
        self.db = db

    def test_seed_db_command_succeeds(self):
        from run import app

        runner = app.test_cli_runner()
        result = runner.invoke(args=["seed-db"])

        assert result.exit_code == 0
        assert "Database seeded successfully" in result.output

    def test_seed_db_command_already_seeded(self):
        from run import app

        runner = app.test_cli_runner()
        runner.invoke(args=["seed-db"])
        result = runner.invoke(args=["seed-db"])

        assert result.exit_code == 0
        assert "already seeded" in result.output

    def test_seed_db_command_blocked_in_production(self, monkeypatch):
        monkeypatch.setenv("FLASK_ENV", "production")
        from run import app

        runner = app.test_cli_runner()
        result = runner.invoke(args=["seed-db"])

        assert result.exit_code != 0 or "cannot be run in production" in result.output
