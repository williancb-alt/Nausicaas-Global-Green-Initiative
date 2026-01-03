import os
from typing import Dict, Type, Union

import click
from flask_sqlalchemy import SQLAlchemy

from nausicass_global_green_initiative_api import create_app, db
from nausicass_global_green_initiative_api.models.user import User
from nausicass_global_green_initiative_api.models.token_blacklist import BlacklistedToken
from nausicass_global_green_initiative_api.models.grant import Grant

app = create_app(os.getenv("FLASK_ENV", "development"))


@app.shell_context_processor
def shell() -> Dict[str, Union[SQLAlchemy, Type[User], Type[BlacklistedToken], Type[Grant]]]:
    return {"db": db, "User": User, "BlacklistedToken": BlacklistedToken, "Grant": Grant}


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
