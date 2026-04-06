"""API endpoints for audit log retrieval (admin only)."""

from http import HTTPStatus

from flask import Response, jsonify
from flask_restx import Namespace, Resource

from nausicass_global_green_initiative_api.api.audit.dto import (
    audit_list_reqparser,
    audit_log_model,
)
from nausicass_global_green_initiative_api.api.auth.decorators import (
    admin_token_required,
)
from nausicass_global_green_initiative_api.models.audit_log import AuditLog

audit_ns = Namespace(name="audit", validate=True)
audit_ns.models[audit_log_model.name] = audit_log_model


def _serialize_audit_log(log: AuditLog) -> dict:
    """Serialize an AuditLog instance to a dictionary."""
    return {
        "id": log.id,
        "timestamp": log.timestamp.isoformat() if log.timestamp else None,
        "user_id": log.user_id,
        "user_email": log.user_email,
        "is_admin": log.is_admin,
        "action": log.action,
        "entity_type": log.entity_type,
        "entity_id": log.entity_id,
        "details": log.details,
        "ip_address": log.ip_address,
        "user_agent": log.user_agent,
        "success": log.success,
        "failure_reason": log.failure_reason,
    }


@audit_ns.route("", endpoint="audit_list")
@audit_ns.response(int(HTTPStatus.FORBIDDEN), "Administrator token required.")
@audit_ns.response(int(HTTPStatus.UNAUTHORIZED), "Unauthorized.")
@audit_ns.response(int(HTTPStatus.INTERNAL_SERVER_ERROR), "Internal server error.")
class AuditLogList(Resource):
    """Handles HTTP requests to URL: /api/v1/audit"""

    @audit_ns.doc(security="Bearer")
    @audit_ns.expect(audit_list_reqparser)
    @audit_ns.response(int(HTTPStatus.OK), "Retrieved audit logs.")
    @admin_token_required
    def get(self) -> Response:
        """Retrieve recent audit logs with optional filters (admin only)."""
        args = audit_list_reqparser.parse_args()
        limit = args.get("limit", 100)
        action = args.get("action")
        success = args.get("success")
        days = args.get("days")
        user_email = args.get("user_email")

        logs = AuditLog.get_filtered_logs(
            limit=limit,
            action=action,
            success=success,
            days=days,
            user_email=user_email,
        )

        response = jsonify(
            {
                "status": "success",
                "count": len(logs),
                "items": [_serialize_audit_log(log) for log in logs],
            }
        )
        response.status_code = HTTPStatus.OK
        return response


@audit_ns.route("/failed", endpoint="audit_failed")
@audit_ns.response(int(HTTPStatus.FORBIDDEN), "Administrator token required.")
@audit_ns.response(int(HTTPStatus.UNAUTHORIZED), "Unauthorized.")
@audit_ns.response(int(HTTPStatus.INTERNAL_SERVER_ERROR), "Internal server error.")
class AuditLogFailed(Resource):
    """Handles HTTP requests to URL: /api/v1/audit/failed"""

    @audit_ns.doc(security="Bearer")
    @audit_ns.expect(audit_list_reqparser)
    @audit_ns.response(int(HTTPStatus.OK), "Retrieved failed audit logs.")
    @admin_token_required
    def get(self) -> Response:
        """Retrieve failed action attempts (admin only)."""
        args = audit_list_reqparser.parse_args()
        limit = args.get("limit", 100)

        logs = AuditLog.get_failed_attempts(limit=limit)

        response = jsonify(
            {
                "status": "success",
                "count": len(logs),
                "items": [_serialize_audit_log(log) for log in logs],
            }
        )
        response.status_code = HTTPStatus.OK
        return response


@audit_ns.route("/entity/<string:entity_type>/<int:entity_id>", endpoint="audit_entity")
@audit_ns.param("entity_type", "Entity type (e.g., 'application', 'grant')")
@audit_ns.param("entity_id", "Entity ID")
@audit_ns.response(int(HTTPStatus.FORBIDDEN), "Administrator token required.")
@audit_ns.response(int(HTTPStatus.UNAUTHORIZED), "Unauthorized.")
@audit_ns.response(int(HTTPStatus.INTERNAL_SERVER_ERROR), "Internal server error.")
class AuditLogEntity(Resource):
    """Handles HTTP requests to URL: /api/v1/audit/entity/{type}/{id}"""

    @audit_ns.doc(security="Bearer")
    @audit_ns.response(int(HTTPStatus.OK), "Retrieved entity audit logs.")
    @admin_token_required
    def get(self, entity_type: str, entity_id: int) -> Response:
        """Retrieve audit logs for a specific entity (admin only)."""
        logs = AuditLog.get_logs_for_entity(entity_type, entity_id)

        response = jsonify(
            {
                "status": "success",
                "entity_type": entity_type,
                "entity_id": entity_id,
                "count": len(logs),
                "items": [_serialize_audit_log(log) for log in logs],
            }
        )
        response.status_code = HTTPStatus.OK
        return response
