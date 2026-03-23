from flask import render_template
from nausicass_global_green_initiative_api import db
from nausicass_global_green_initiative_api.models.application import Application
from nausicass_global_green_initiative_api.models.support_message import SupportMessage
from nausicass_global_green_initiative_api.models.user import User
from nausicass_global_green_initiative_api.services.email_service import EmailService
from nausicass_global_green_initiative_api.util.datetime_util import utc_now


class SupportService:
    @staticmethod
    def create_support_message(
        user_id: int, application_id: int, subject: str, message: str
    ) -> SupportMessage:
        user, application = SupportService._validate_creation_request(
            user_id, application_id
        )

        support_msg = SupportMessage(
            user_id=user_id,
            application_id=application_id,
            subject=subject,
            message=message,
        )
        db.session.add(support_msg)
        db.session.commit()

        SupportService._notify_admins_of_support_request(
            user.email, application.id, subject, message
        )
        return support_msg

    @staticmethod
    def _validate_creation_request(user_id: int, application_id: int):
        user = db.session.get(User, user_id)
        if not user:
            raise ValueError("User not found.")

        application = db.session.get(Application, application_id)
        if not application:
            raise ValueError("Application not found.")

        if application.user_id != user_id:
            raise ValueError("Unauthorized access to application.")

        return user, application

    @staticmethod
    def _notify_admins_of_support_request(
        email: str, application_id: int, subject: str, message: str
    ):
        admins = User.query.filter_by(admin=True).all()
        admin_emails = [admin.email for admin in admins if admin.email]

        if admin_emails:
            email_html = render_template(
                "email/support_admin_alert.html",
                email=email,
                application_id=application_id,
                subject=subject,
                message=message,
            )

            EmailService.send_email(
                to=admin_emails, subject=f"[NEW TICKET] {subject}", html_body=email_html
            )

    @staticmethod
    def get_all_messages():
        return SupportMessage.get_all()

    @staticmethod
    def reply_to_support_message(message_id: int, reply_text: str):
        support_msg, user = SupportService._get_reply_context(message_id)

        SupportService._notify_user_of_support_reply(support_msg, user, reply_text)

        # Update status and save response
        support_msg.status = "Replied"
        support_msg.admin_response = reply_text
        support_msg.answered_at = utc_now()
        db.session.commit()
        return support_msg

    @staticmethod
    def _get_reply_context(message_id: int):
        support_msg = db.session.get(SupportMessage, message_id)
        if not support_msg:
            raise ValueError("Support message not found.")

        user = db.session.get(User, support_msg.user_id)
        if not user:
            raise ValueError("User not found.")

        return support_msg, user

    @staticmethod
    def _notify_user_of_support_reply(support_msg, user, reply_text: str):
        email_html = render_template(
            "email/support_reply.html",
            email=user.email,
            application_id=support_msg.application_id,
            reply_text=reply_text,
            original_message=support_msg.message,
        )

        email_subject = (
            f"[TICKET UPDATE] RE: {support_msg.subject} "
            f"[App #{support_msg.application_id}]"
        )
        EmailService.send_email(
            to=[user.email],
            subject=email_subject,
            html_body=email_html,
        )
