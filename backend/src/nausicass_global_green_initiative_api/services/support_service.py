from nausicass_global_green_initiative_api import db
from nausicass_global_green_initiative_api.models.support_message import SupportMessage
from nausicass_global_green_initiative_api.models.user import User
from nausicass_global_green_initiative_api.models.application import Application
from nausicass_global_green_initiative_api.services.email_service import EmailService

class SupportService:
    @staticmethod
    def create_support_message(user_id: int, application_id: int, subject: str, message: str) -> SupportMessage:
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
            message=message
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
                to=admin_emails,
                subject=f"New Support Ticket: {subject}",
                html_body=email_html
            )

        return support_msg

    @staticmethod
    def get_all_messages():
        return SupportMessage.get_all()
