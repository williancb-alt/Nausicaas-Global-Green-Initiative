from __future__ import annotations

from typing import TypedDict
from datetime import datetime


class GrantDictionary(TypedDict, total=False):
    """Type definition for API requests regarding grants"""

    name: str
    deadline: datetime
    description: str
    custom_fields: str | None
    hidden: bool
