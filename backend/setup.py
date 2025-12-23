from pathlib import Path
from setuptools import setup, find_packages

DESCRIPTION = (
    "Boilerplate Flask API for Nausicaas Global Green Initiative with"
    "Flask-RESTx, SQLAlchemy, pytest, flake8, tox configured"
)
APP_ROOT = Path(__file__).parent
README = (APP_ROOT / "README.md").read_text()
AUTHOR = "DevOps Project Management - Group 2"
PROJECT_URLS = {
    "Documentation": "https://github.com/williancb-alt/Nausicaas-Global-Green-Initiative/wiki",  # noqa: E501
    "Bug Tracker": "https://github.com/williancb-alt/Nausicaas-Global-Green-Initiative/issues",  # noqa: E501
    "Source Code": "https://github.com/williancb-alt/Nausicaas-Global-Green-Initiative",
}
INSTALL_REQUIRES = [
    "Flask>=3.1.0",
    "Flask-Bcrypt",
    "Flask-Cors",
    "Flask-Migrate",
    "flask-restx",
    "Flask-SQLAlchemy>=3.1.0",
    "psycopg2-binary",
    "PyJWT",
    "python-dateutil",
    "python-dotenv",
    "requests",
    "urllib3",
]
EXTRAS_REQUIRE = {
    "dev": [
        "black",
        "flake8",
        "pre-commit",
        "pydocstyle",
        "pytest",
        "pytest-black",
        "pytest-clarity",
        "pytest-dotenv",
        "pytest-flake8",
        "pytest-flask",
        "tox",
    ]
}

setup(
    name="nausicass-global-green-initiative-api",
    description=DESCRIPTION,
    long_description=README,
    long_description_content_type="text/markdown",
    version="0.1",
    author=AUTHOR,
    maintainer=AUTHOR,
    license="MIT",
    url="https://github.com/williancb-alt/Nausicaas-Global-Green-Initiative",
    project_urls=PROJECT_URLS,
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    python_requires=">=3.11",
    install_requires=INSTALL_REQUIRES,
    extras_require=EXTRAS_REQUIRE,
)
