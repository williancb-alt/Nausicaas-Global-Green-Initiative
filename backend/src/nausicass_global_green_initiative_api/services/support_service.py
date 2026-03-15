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
            email_html = f"""
            <p><strong>New Support Request</strong></p>
            <p><strong>From:</strong> {user.email}</p>
            <p><strong>Application ID:</strong> {application.id}</p>
            <p><strong>Subject:</strong> {subject}</p>
            <p><strong>Message:</strong></p>
            <blockquote>{message}</blockquote>
            """

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
        email_html = (
            '<div style="font-family: Arial, sans-serif; line-height: 1.6; '
            'color: #333;">\n'
            f"    <p>Dear {user.email},</p>\n"
            "    <p>Thank you for contacting our Environmental Program Office. "
            "We have a response regarding your support request for "
            f"<strong>Application #{support_msg.application_id}</strong>:</p>\n"
            '    <div style="padding: 15px; background: #f9f9f9; '
            'border-left: 4px solid #3b7a57; margin: 20px 0;">\n'
            f"        {reply_text}\n"
            "    </div>\n"
            "    <p>Original Message:</p>\n"
            '    <blockquote style="color: #666; font-style: italic; '
            'border-left: 2px solid #ddd; padding-left: 10px;">\n'
            f"        {support_msg.message}\n"
            "    </blockquote>\n"
            "    <p>Best Regards,<br>Nausicaas Global Green Initiative Team</p>\n"
            '    <hr style="border: none; border-top: 1px solid #eee; '
            'margin: 20px 0;">\n'
            '    <p style="font-size: 0.9rem; color: #555;"><strong>Note:</strong> '
            "If you are not satisfied with this response or have further questions, "
            "please raise a new support ticket through your dashboard.</p>\n"
            '    <p style="font-size: 0.8rem; color: #999;">This is an automated '
            "notification and this mailbox is not monitored. Please do not reply "
            "directly to this email.</p>\n"
            "</div>"
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
