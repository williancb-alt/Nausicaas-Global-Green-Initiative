import time
from dataclasses import dataclass

from azure.communication.email import EmailClient
from azure.core.exceptions import AzureError, HttpResponseError, ServiceRequestError
from flask import current_app


class EmailSendError(RuntimeError):
    pass


@dataclass(frozen=True)
class EmailSendOptions:
    timeout_seconds: int
    max_retries: int
    fail_silently: bool
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

        sender = EmailService._get_sender()
        recipients = EmailService._normalise_recipients(to)
        EmailService._validate_payload(recipients, subject)

        config = EmailMessageConfig(
            sender=sender,
            recipients=recipients,
            subject=subject.strip(),
            html_body=html_body,
            plain_body=plain_body,
        )

        message = EmailService._build_message(config)

        try:
            message_id = EmailService._send_with_retries(
                client=EmailService._get_client(),
                email_message=message,
                timeout_seconds=opts.timeout_seconds,
                max_retries=opts.max_retries,
            )
            current_app.logger.info(
                "Email sent via ACS",
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
            if opts.fail_silently:
                return None
            raise EmailSendError("Failed to send email via ACS") from exc

    @staticmethod
    def _effective_options() -> EmailSendOptions:
        cfg = current_app.config

        enabled = EmailService._coerce_bool(cfg.get("EMAIL_ENABLED", True))
        timeout_seconds = int(cfg.get("ACS_EMAIL_TIMEOUT_SECONDS", 10))
        max_retries = int(cfg.get("ACS_EMAIL_MAX_RETRIES", 2))
        fail_silently = EmailService._coerce_bool(
            cfg.get("ACS_EMAIL_FAIL_SILENTLY", False)
        )

        return EmailSendOptions(
            timeout_seconds=timeout_seconds,
            max_retries=max_retries,
            fail_silently=fail_silently,
            enabled=enabled,
        )

    @staticmethod
    def _coerce_bool(value: object) -> bool:
        if isinstance(value, bool):
            return value
        if value is None:
            return False
        if isinstance(value, (int, float)):
            return bool(value)
        if isinstance(value, str):
            v = value.strip().lower()
            if v in {"1", "true", "yes", "y", "on"}:
                return True
            if v in {"0", "false", "no", "n", "off", ""}:
                return False
        return bool(value)

    @staticmethod
    def _get_sender() -> str:
        sender = current_app.config.get("ACS_EMAIL_SENDER")
        if not sender:
            raise RuntimeError("ACS_EMAIL_SENDER is not configured")
        return str(sender)

    @staticmethod
    def _get_client() -> EmailClient:
        conn_str = current_app.config.get("ACS_EMAIL_CONNECTION_STRING")
        if not conn_str:
            raise RuntimeError("ACS_EMAIL_CONNECTION_STRING is not configured")
        return EmailClient.from_connection_string(conn_str)

    @staticmethod
    def _normalise_recipients(to: list[str] | tuple[str, ...]) -> list[str]:
        cleaned: list[str] = []
        seen: set[str] = set()

        for addr in to:
            a = (addr or "").strip()
            if not a or a in seen:
                continue
            cleaned.append(a)
            seen.add(a)

        return cleaned

    @staticmethod
    def _validate_payload(recipients: list[str], subject: str) -> None:
        if not recipients:
            raise ValueError("No recipient email addresses provided")
        if not (subject or "").strip():
            raise ValueError("Email subject must not be empty")

    @staticmethod
    def _build_message(parts: EmailMessageConfig) -> dict:
        msg = {
            "senderAddress": parts.sender,
            "recipients": {"to": [{"address": addr} for addr in parts.recipients]},
            "content": {"subject": parts.subject, "html": parts.html_body},
        }
        if parts.plain_body:
            msg["content"]["plainText"] = parts.plain_body
        return msg

    @staticmethod
    def _should_retry(exc: AzureError, attempt: int, max_retries: int) -> bool:
        if attempt >= max_retries:
            return False

        if isinstance(exc, ServiceRequestError):
            return True

        if isinstance(exc, HttpResponseError):
            return EmailService._is_retryable_http_error(exc)

        return False

    @staticmethod
    def _send_with_retries(
        *,
        client: EmailClient,
        email_message: dict,
        timeout_seconds: int,
        max_retries: int,
    ) -> str:
        for attempt in range(max_retries + 1):
            try:
                return EmailService._send_once(
                    client=client,
                    email_message=email_message,
                    timeout_seconds=timeout_seconds,
                )
            except AzureError as exc:
                if not EmailService._should_retry(exc, attempt, max_retries):
                    raise
                time.sleep(EmailService._retry_after_seconds(exc, attempt))

        raise RuntimeError("Unreachable")

    @staticmethod
    def _send_once(
        *,
        client: EmailClient,
        email_message: dict,
        timeout_seconds: int,
    ) -> str:
        poller = client.begin_send(email_message)
        result = poller.result(timeout=timeout_seconds)
        message_id = getattr(result, "message_id", None) or getattr(result, "id", None)
        return str(message_id) if message_id is not None else ""

    @staticmethod
    def _is_retryable_http_error(exc: HttpResponseError) -> bool:
        status = getattr(exc, "status_code", None)
        return status == 429 or (isinstance(status, int) and status >= 500)

    @staticmethod
    def _retry_after_seconds(exc: AzureError, attempt: int) -> int:
        """Seconds to wait before retry: use Retry-After for 429, else backoff."""
        if not (
            isinstance(exc, HttpResponseError)
            and getattr(exc, "status_code", None) == 429
        ):
            return EmailService._backoff_seconds(attempt)
        return EmailService._parse_retry_after_from_429(exc)

    @staticmethod
    def _parse_retry_after_from_429(exc: HttpResponseError) -> int:
        """Parse Retry-After from a 429 response; return default if missing/invalid."""
        default = 15
        max_wait = 60
        try:
            response = getattr(exc, "response", None)
            if response is None:
                return default
            headers = getattr(response, "headers", None)
            if headers is None:
                return default
            ra = headers.get("Retry-After")
            if ra is None:
                return default
            if isinstance(ra, int):
                return max(10, min(ra, max_wait))
            s = str(ra).strip()
            if s.isdigit():
                return max(10, min(int(s), max_wait))
        except (ValueError, TypeError, AttributeError):
            pass
        return default

    @staticmethod
    def _backoff_seconds(attempt: int) -> int:
        return min(2**attempt, 8)
