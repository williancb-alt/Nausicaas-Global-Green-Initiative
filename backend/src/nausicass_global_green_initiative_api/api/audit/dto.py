"""DTOs and request parsers for audit API endpoints."""

from flask_restx import Model
from flask_restx.fields import Boolean, Integer, String
from flask_restx.inputs import positive
from flask_restx.reqparse import RequestParser

audit_log_model = Model(
    "AuditLog",
    {
        "id": Integer,
        "timestamp": String,
        "user_id": Integer,
        "user_email": String,
        "is_admin": Boolean,
        "action": String,
        "entity_type": String,
        "entity_id": Integer,
        "details": String,
        "success": Boolean,
        "failure_reason": String,
    },
)

audit_list_reqparser = RequestParser(bundle_errors=True)
audit_list_reqparser.add_argument(
    "limit",
    type=positive,
    required=False,
    default=100,
    help="Maximum number of audit logs to return (default: 100)",
)
audit_list_reqparser.add_argument(
    "action",
    type=str,
    required=False,
    help="Filter by action type",
)
audit_list_reqparser.add_argument(
    "success",
    type=bool,
    required=False,
    help="Filter by success status",
)