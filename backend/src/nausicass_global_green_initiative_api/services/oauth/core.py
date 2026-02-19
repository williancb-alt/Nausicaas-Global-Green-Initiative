from __future__ import annotations

import logging
from typing import Protocol

from authlib.integrations.flask_client import OAuth

oauth = OAuth()
logger = logging.getLogger(__name__)


class OAuthProvider(Protocol):
    """Interface for an OAuth provider: start login and handle callback."""

    def start_login(self):
        pass

    def handle_callback(self):
        pass
