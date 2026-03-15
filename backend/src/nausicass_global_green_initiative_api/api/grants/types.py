from __future__ import annotations

from datetime import datetime
from typing import TypedDict


class GrantDictionary(TypedDict, total=False):
    """Type definition for API requests regarding grants"""

    name: str
    deadline: datetime
    description: str
    custom_fields: str | None
    hidden: bool
