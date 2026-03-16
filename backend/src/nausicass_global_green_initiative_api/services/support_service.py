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
        user = User.query.get(user_id)
        if not user:
            raise ValueError("User not found.")

        application = Application.query.get(application_id)
        if not application:
            raise ValueError("Application not found.")

        if application.user_id != user_id:
            raise ValueError("Unauthorized access to application.")

        support_msg = SupportMessage(
            user_id=user_id,
            application_id=application_id,
            subject=subject,
            message=message,
        )
        db.session.add(support_msg)
        db.session.commit()

        # Notify admins
        admins = User.query.filter_by(admin=True).all()
        admin_emails = [admin.email for admin in admins if admin.email]

        if admin_emails:
            email_html = render_template(
                "email/support_admin_alert.html",
                email=user.email,
                application_id=application.id,
                subject=subject,
                message=message,
            )

            EmailService.send_email(
                to=admin_emails, subject=f"[NEW TICKET] {subject}", html_body=email_html
            )

        return support_msg

    @staticmethod
    def get_all_messages():
        return SupportMessage.get_all()

    @staticmethod
    def reply_to_support_message(message_id: int, reply_text: str):
        support_msg = SupportMessage.query.get(message_id)
        if not support_msg:
            raise ValueError("Support message not found.")

        user = User.query.get(support_msg.user_id)
        if not user:
            raise ValueError("User not found.")

        # Send email to user
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

        # Update status and save response
        support_msg.status = "Replied"
        support_msg.admin_response = reply_text
        support_msg.answered_at = utc_now()
        db.session.commit()
        return support_msg
