import json
import logging
from datetime import datetime, timezone

from flask import g

# Dummy log record to get standard attributes on log entry
_STANDARD_ATTRIBUTES = logging.LogRecord("", 0, "", 0, "", (), None).__dict__.keys()


class JSONLogsFormat(logging.Formatter):
    """
    Custom formatter to output logs in JSON format for
    Azure Monitor Container Insights.
    """

    def format(self, record: logging.LogRecord) -> str:
        # Base log entry with standard fields
        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        # Attach request ID from flask global if available
        request_id = getattr(record, "request_id", None) or _get_request_id()

        # If present, include it as property
        if request_id:
            log_entry["request_id"] = request_id

        # If there's exception info, include it
        if record.exc_info and record.exc_info[0] is not None:
            log_entry["exception"] = self.formatException(record.exc_info)

        # Include any extra fields passed in log call
        for key, value in record.__dict__.items():
            # Avoid overwriting standard attributes
            # or existing log entry keys
            if key not in _STANDARD_ATTRIBUTES and key not in log_entry:
                log_entry[key] = value

        # Convert the log entry to a JSON string
        return json.dumps(log_entry, default=str)


def _get_request_id() -> str | None:
    """
    Try to retrieve request ID from Flask
    """
    try:
        # Use flask.g to get request_id if available
        return g.get("request_id")
    except RuntimeError:
        # Othwerwise, return None
        return None
