import os
from typing import Dict, Type, Union

import click
from flask_sqlalchemy import SQLAlchemy

from nausicass_global_green_initiative_api import create_app, db
from nausicass_global_green_initiative_api.models.audit_log import AuditLog
from nausicass_global_green_initiative_api.models.award import Award
from nausicass_global_green_initiative_api.models.grant import Grant
from nausicass_global_green_initiative_api.models.password_reset_token import (
    PasswordResetToken,
)
from nausicass_global_green_initiative_api.models.support_message import SupportMessage
from nausicass_global_green_initiative_api.models.token_blacklist import BlacklistedToken
from nausicass_global_green_initiative_api.models.user import User
from nausicass_global_green_initiative_api.models.user_oauth_account import (
    UserOAuthAccount,
)

app = create_app(os.getenv("FLASK_ENV", "development"))


@app.shell_context_processor
def shell() -> Dict[
    str,
    Union[
        SQLAlchemy,
        Type[User],
        Type[BlacklistedToken],
        Type[Grant],
        Type[AuditLog],
        Type[Award],
        Type[UserOAuthAccount],
        Type[PasswordResetToken],
        Type[SupportMessage],
    ],
]:
    return {
        "db": db,
        "User": User,
        "UserOAuthAccount": UserOAuthAccount,
        "BlacklistedToken": BlacklistedToken,
        "Grant": Grant,
        "AuditLog": AuditLog,
        "PasswordResetToken": PasswordResetToken,
        "SupportMessage": SupportMessage,
    }


@app.cli.command("add-user", short_help="Add a new user")
@click.argument("email")
@click.option(
    "--admin", is_flag=True, default=False, help="New user has administrator role"
)
@click.password_option(help="Do not set password on the command line!")
def add_user(email: str, admin: bool, password: str) -> int:
    """Add a new user to the database with email address = EMAIL."""
    if User.find_by_email(email):
        error = f"Error: {email} is already registered"
        click.secho(f"{error}\n", fg="red", bold=True)
        return 1
    new_user = User(email=email, password=password, admin=admin)
    db.session.add(new_user)
    db.session.commit()
    user_type = "admin user" if admin else "user"
    message = f"Successfully added new {user_type}:\n {new_user}"
    click.secho(message, fg="blue", bold=True)
    return 0


@app.cli.command("seed-db", short_help="Seed the database with sample data")
def seed_db() -> int:
    """
    Seed the database with sample users, grants, awards, and applications.

    Only runs in dev and testing environments. Will not run in production.
    """

    # Get the current FLASK_ENV, defaults to dev if not set
    flask_env = os.getenv("FLASK_ENV", "development")

    # Prevent running in prod environment
    if flask_env == "production":
        click.secho("Error: seed-db cannot be run in production.", fg="red", bold=True)
        return 1

    from nausicass_global_green_initiative_api.seed import run_seed

    # Call helper function to seed the db and capture summary
    result = run_seed()

    # If None is returned, db was already seeded
    if result is None:
        click.secho("Database already seeded.", fg="yellow")
        return 0

    # Print summary of seeded data in db to the console
    click.secho("Database seeded successfully!", fg="green", bold=True)
    click.echo("Users:")
    for u in result["users"]:
        role = " (admin)" if u["admin"] else ""
        click.echo(f" - {u['email']}{role}")
    click.echo(f" Grants: {result['grants']}")
    click.echo(f" Awards: {result['awards']}")
    click.echo(f" Applications: {result['applications']}")
    click.echo(f" Support Messages: {result['support_messages']}")
    click.echo(f" Audit Logs: {result['audit_logs']}")
    return 0
