from http import HTTPStatus
from flask import request
from flask_restx import Namespace, Resource

from nausicass_global_green_initiative_api.api.support.dto import (
    create_support_reqparser,
    reply_support_reqparser,
    support_message_model,
)
from nausicass_global_green_initiative_api.api.applications.dto import applicant_model
from nausicass_global_green_initiative_api.services.support_service import SupportService
from nausicass_global_green_initiative_api.models.user import User
from nausicass_global_green_initiative_api.api.auth.decorators import (
    token_required,
    admin_token_required,
)

support_ns = Namespace("support", description="Operations relating to support messages")
support_ns.models[applicant_model.name] = applicant_model
support_ns.models[support_message_model.name] = support_message_model


@support_ns.route("")
class SupportList(Resource):
    @support_ns.doc(security="Bearer")
    @support_ns.expect(create_support_reqparser)
    @support_ns.response(int(HTTPStatus.CREATED), "Support message sent successfully")
    @support_ns.response(int(HTTPStatus.NOT_FOUND), "Application not found")
    @support_ns.response(
        int(HTTPStatus.UNAUTHORIZED), "Unauthorized access to application"
    )
    @token_required
    def post(self):
        """Create a new support message."""
        req_data = create_support_reqparser.parse_args()
        application_id = req_data.get("application_id")
        subject = req_data.get("subject")
        message = req_data.get("message")

        public_id = SupportList.post.public_id
        user = User.find_by_public_id(public_id)
        if not user:
            support_ns.abort(int(HTTPStatus.UNAUTHORIZED), "User not found")

        try:
            SupportService.create_support_message(
                user_id=user.id,
                application_id=application_id,
                subject=subject,
                message=message,
            )
            return {"message": "Support message sent successfully."}, HTTPStatus.CREATED
        except ValueError as e:
            if "not found" in str(e).lower():
                support_ns.abort(int(HTTPStatus.NOT_FOUND), str(e))
            elif "unauthorized" in str(e).lower():
                support_ns.abort(int(HTTPStatus.UNAUTHORIZED), str(e))
            else:
                support_ns.abort(int(HTTPStatus.BAD_REQUEST), str(e))

    @support_ns.doc(security="Bearer")
    @support_ns.marshal_list_with(support_message_model)
    @admin_token_required
    def get(self):
        """Get all support messages."""
        messages = SupportService.get_all_messages()
        return messages, HTTPStatus.OK


@support_ns.route("/<int:message_id>/reply")
class SupportReply(Resource):
    @support_ns.doc(security="Bearer")
    @support_ns.expect(reply_support_reqparser)
    @support_ns.response(int(HTTPStatus.OK), "Reply sent successfully")
    @support_ns.response(int(HTTPStatus.NOT_FOUND), "Message not found")
    @admin_token_required
    def post(self, message_id: int):
        """Send a reply to a support message."""
        req_data = reply_support_reqparser.parse_args()
        reply_text = req_data.get("message")

        try:
            SupportService.reply_to_support_message(message_id, reply_text)
            return {"message": "Reply sent successfully."}, HTTPStatus.OK
        except ValueError as e:
            support_ns.abort(int(HTTPStatus.NOT_FOUND), str(e))
