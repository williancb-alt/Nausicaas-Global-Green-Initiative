# Email functionality

## Overview
Azure Communications Service is used to send emails within the backend on key events (currenly only on signup but this should be extended to others).

On Azure communications service, a custom domain has been configured and validated for DKIM and SPF (to enable emails to avoid being put into spam folders).

There are some benefits to having a custom domain for emails including:

- Users recognise the email address and are more likely to open
- Less likely to be put into spam folder of users inbox
- Higher rate limits within Azure Communications service for validated domains.

## Local Environment Setup
To get this functionality working locally, a number of environment variables need to be set in a .env file:

```
ACS_EMAIL_CONNECTION_STRING="Message John D for value"
ACS_EMAIL_SENDER="Message John D for value"
EMAIL_ENABLED=true
```

There are two ways that the application is run:

- Docker compose used to build everything (in this scenario, the .env file needs to be at the repository root)
- Services manually started from the terminal (in this scenario, the .env file needs to be within the backend directory - at the root of that)

## How is it configured?

An `EmailService` class (at `backend/src/nausicass_global_green_initiative_api/services/email_service.py`) contains the main functionality for interacting with the Azure Communications Service (via the provided `azure-communication-email` package).

This uses the credentials configured within the .env file to authenticate and authorise us with Azure.

The `EmailService` class exposes a handy function `send_email` for triggering the email event.

Currently, this is only used in `backend/src/nausicass_global_green_initiative_api/api/auth/handlers.py`

Where the below function is declared to wrap this

```
def _send_welcome_email_async(app, email: str) -> None:
    with app.app_context():
        try:
            html_body = render_template("email/welcome.html", email=email)
            plain_body = f"Your account {email} has been created."
            EmailService.send_email(
                to=[email],
                subject="Welcome to Nausicaas Global Green Initiative",
                html_body=html_body,
                plain_body=plain_body,
            )
        except Exception:
            app.logger.exception("Failed to send welcome email")
```

As we can see above, the email body is constructed using the `render_template` function (passing a path to the email template `email/welcome.html`).

If we look at that file (shown below), it is static content apart from the `{{email}}` value.

By wrapping text in those brackets, it indicates to the templating engine that this is dynamic content that we wish to populate in the function call.

```
<p>Hi,</p>
<p>Your account {{ email }} has been created.</p>
```

As you can see below, we pass a variable `email=email` in the function call. For plain_body, we mimic the html_body (dynamically passing in the email).

```
html_body = render_template("email/welcome.html", email=email)
plain_body = f"Your account {email} has been created."
```

So all email templates should live at `backend/src/nausicass_global_green_initiative_api/templates/email` directory (e.g. if a new template is required for another email just add a new file with the content you wish to render in the email).

The reason for adding the above is that we can then call it using the `threading` package as shown below.

```
threading.Thread(
        target=_send_welcome_email_async,
        args=(app, email),
        daemon=True,
    ).start()
```

The advantage of using this is that the above code runs on a separate thread, making it non-blocking (otherwise the code would hang until the email is sent, which would add a delay to the API getting a response back to the browser).

## Extending Functionality: Adding New Email Types

To add a new type of email (for example, a password reset email), follow these steps:

1. **Create a new email template**  
   Add a new HTML file in the `backend/src/nausicass_global_green_initiative_api/templates/email` directory.  
   Example: `password_reset.html`
   ```html
   <p>Hi,</p>
   <p>To reset your password, click <a href="{{ reset_link }}">here</a>.</p>
   ```

2. **Render the template and send the email**  
   In your handler or service, use Flask’s `render_template` to render the new template, passing any required variables:
   ```python
   html_body = render_template("email/password_reset.html", reset_link=reset_link)
   plain_body = f"To reset your password, visit: {reset_link}"
   EmailService.send_email(
       to=[user_email],
       subject="Password Reset Instructions",
       html_body=html_body,
       plain_body=plain_body,
   )
   ```

3. **Configure to send asynchronously in separate thread**  
   If you want to send the email in a non-blocking way (recommended best practice), wrap your email-sending logic in a function and use `threading.Thread` to run it on a separate thread.  
   This ensures the API response is not delayed by the email operation. For example:

   ```python
   def _send_password_reset_email_async(app, user_email, reset_link):
       with app.app_context():
           try:
               html_body = render_template("email/password_reset.html", reset_link=reset_link)
               plain_body = f"To reset your password, visit: {reset_link}"
               EmailService.send_email(
                   to=[user_email],
                   subject="Password Reset Instructions",
                   html_body=html_body,
                   plain_body=plain_body,
               )
           except Exception:
               app.logger.exception("Failed to send password reset email")

   threading.Thread(
       target=_send_password_reset_email_async,
       args=(app, user_email, reset_link),
       daemon=True,
   ).start()
   ```

4. **Update your API or business logic**  
   Trigger this email from the appropriate place in your codebase (e.g., when a user requests a password reset).

**Tip:**  
Always add new templates to the `templates/email` directory and use `EmailService.send_email` for consistency.

