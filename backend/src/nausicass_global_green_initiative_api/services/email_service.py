import smtplib
from email.message import EmailMessage
from email.utils import make_msgid, formatdate
from dataclasses import dataclass

from flask import current_app


class EmailSendError(RuntimeError):
    pass


@dataclass(frozen=True)
class EmailSendOptions:
    timeout_seconds: int
    enabled: bool


@dataclass(frozen=True)
class EmailMessageConfig:
    sender: str
    recipients: list[str]
    subject: str
    html_body: str
    plain_body: str | None


class EmailService:
    @staticmethod
    def send_email(
        to: list[str] | tuple[str, ...],
        subject: str,
        html_body: str,
        plain_body: str | None = None,
    ) -> str | None:
        opts = EmailService._effective_options()

        if not opts.enabled:
            current_app.logger.info(
                "Email disabled; skipping send",
                extra={"to_count": len(to), "subject": subject},
            )
            return None

        # Fallback for local development/testing without real credentials
        server = current_app.config.get("SMTP_SERVER")
        if not server or str(server).strip() in ("", "''", '""'):
            current_app.logger.info(
                f"[LOCAL EMAIL MOCK] Sending email to {to}\nSubject: {subject}\nBody: {html_body}"
            )
            return "local-mock-message-id"

        sender = EmailService._get_sender()
        recipients = list(set([a.strip() for a in to if a and a.strip()]))
        if not recipients:
            raise ValueError("No recipient email addresses provided")
        if not subject or not subject.strip():
            raise ValueError("Email subject must not be empty")

        config = EmailMessageConfig(
            sender=sender,
            recipients=recipients,
            subject=subject.strip(),
            html_body=html_body,
            plain_body=plain_body,
        )

        try:
            message_id = EmailService._send_once(config, opts.timeout_seconds)
            current_app.logger.info(
                "Email sent via SMTP",
                extra={
                    "message_id": message_id,
                    "to_count": len(recipients),
                    "subject": subject.strip(),
                },
            )
            return message_id
        except Exception as exc:
            current_app.logger.exception(
                "Email send failed",
                extra={"to_count": len(recipients), "subject": subject.strip()},
            )
            if current_app.config.get("SMTP_FAIL_SILENTLY", False):
                return None
            raise EmailSendError("Failed to send email via SMTP") from exc

    @staticmethod
    def _effective_options() -> EmailSendOptions:
        cfg = current_app.config
        val = cfg.get("EMAIL_ENABLED", True)
        if isinstance(val, str):
            enabled = val.lower() in ("1", "true", "yes", "y", "on")
        else:
            enabled = bool(val)
        timeout_seconds = int(cfg.get("SMTP_TIMEOUT_SECONDS", 10))
        return EmailSendOptions(timeout_seconds=timeout_seconds, enabled=enabled)

    @staticmethod
    def _get_sender() -> str:
        sender = current_app.config.get("SMTP_SENDER")
        if not sender or str(sender).strip() in ("", "''", '""'):
            server = current_app.config.get("SMTP_SERVER")
            if not server or str(server).strip() in ("", "''", '""'):
                return "local-mock@example.com"
            raise RuntimeError("SMTP_SENDER is not configured")
        return str(sender)

    @staticmethod
    def _send_once(config: EmailMessageConfig, timeout: int) -> str:
        msg = EmailMessage()
        msg["Subject"] = config.subject
        msg["From"] = config.sender
        msg["To"] = ", ".join(config.recipients)
        msg["Date"] = formatdate(localtime=True)
        message_id = make_msgid()
        msg["Message-ID"] = message_id

        if config.plain_body:
            msg.set_content(config.plain_body)
            msg.add_alternative(config.html_body, subtype="html")
        else:
            msg.set_content(config.html_body, subtype="html")

        server = str(current_app.config.get("SMTP_SERVER", ""))
        port = int(current_app.config.get("SMTP_PORT", 587))
        username = current_app.config.get("SMTP_USERNAME", "")
        password = current_app.config.get("SMTP_PASSWORD", "")

        # We try explicit TLS on port 465 (SMTP_SSL) or STARTTLS on other ports
        use_ssl = port == 465

        if use_ssl:
            with smtplib.SMTP_SSL(server, port, timeout=timeout) as smtp:
                if username and password:
                    smtp.login(str(username), str(password))
                smtp.send_message(msg)
        else:
            with smtplib.SMTP(server, port, timeout=timeout) as smtp:
                smtp.ehlo()
                if port == 587 or current_app.config.get("SMTP_USE_TLS", False):
                    smtp.starttls()
                if username and password:
                    smtp.login(str(username), str(password))
                smtp.send_message(msg)

        return message_id
