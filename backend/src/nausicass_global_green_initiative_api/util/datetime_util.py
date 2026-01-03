import time
from collections import namedtuple
from datetime import datetime, timedelta, timezone
from typing import Optional


DT_AWARE = "%m/%d/%y %I:%M:%S %p %Z"
DT_NAIVE = "%m/%d/%y %I:%M:%S %p"
DATE_MONTH_NAME = "%b %d %Y"
ONE_DAY_IN_SECONDS = 86400

timespan = namedtuple(
    "timespan",
    [
        "days",
        "hours",
        "minutes",
        "seconds",
        "milliseconds",
        "microseconds",
        "total_seconds",
        "total_milliseconds",
        "total_microseconds",
    ],
)


def utc_now() -> datetime:
    """Current UTC date and time with the microsecond value normalized to zero."""
    return datetime.now(timezone.utc).replace(microsecond=0)


def localized_dt_string(dt: datetime, use_tz: Optional[timezone] = None) -> str:
    """Convert datetime value to a string, localized for the specified timezone."""
    if not dt.tzinfo and not use_tz:
        return dt.strftime(DT_NAIVE)
    if not dt.tzinfo:
        return dt.replace(tzinfo=use_tz).strftime(DT_AWARE)
    return dt.astimezone(use_tz).strftime(DT_AWARE) if use_tz else dt.strftime(DT_AWARE)


def get_local_utcoffset() -> timezone:
    """Get UTC offset from local system and return as timezone object."""
    utc_offset = timedelta(seconds=time.localtime().tm_gmtoff)
    return timezone(offset=utc_offset)


def make_tzaware(
    dt: datetime, use_tz: Optional[timezone] = None, localize: bool = True
) -> datetime:
    """Make a naive datetime object timezone-aware."""
    if not use_tz:
        use_tz = get_local_utcoffset()
    return dt.astimezone(use_tz) if localize else dt.replace(tzinfo=use_tz)


def dtaware_fromtimestamp(
    timestamp: int | float, use_tz: Optional[timezone] = None
) -> datetime:
    """Time-zone aware datetime object from UNIX timestamp."""
    timestamp_naive = datetime.fromtimestamp(timestamp)
    timestamp_aware = timestamp_naive.replace(tzinfo=get_local_utcoffset())
    return timestamp_aware.astimezone(use_tz) if use_tz else timestamp_aware


def remaining_fromtimestamp(timestamp: int | float) -> timespan:
    """Calculate time remaining from now until UNIX timestamp value."""
    now = datetime.now(timezone.utc)
    dt_aware = dtaware_fromtimestamp(timestamp, use_tz=timezone.utc)
    if dt_aware < now:
        return timespan(0, 0, 0, 0, 0, 0, 0, 0, 0)
    return get_timespan(dt_aware - now)


def format_timespan_digits(ts: timespan) -> str:
    """Format a timespan namedtuple as a string resembling a digital display."""
    if ts.days:
        day_or_days = "days" if ts.days > 1 else "day"
        return (
            f"{ts.days} {day_or_days}, "
            f"{ts.hours:02d}:{ts.minutes:02d}:{ts.seconds:02d}"
        )
    if ts.seconds:
        return f"{ts.hours:02d}:{ts.minutes:02d}:{ts.seconds:02d}"
    return f"00:00:00.{ts.total_microseconds}"


def format_timedelta_digits(td: timedelta) -> str:
    """Format a timedelta object as a string resembling a digital display."""
    return format_timespan_digits(get_timespan(td))


def format_timespan_str(ts: timespan) -> str:
    """Format a timespan namedtuple as a readable string."""
    if ts.days:
        day_or_days = "days" if ts.days > 1 else "day"
        return (
            f"{ts.days} {day_or_days} "
            f"{ts.hours:.0f} hours {ts.minutes:.0f} minutes {ts.seconds} seconds"
        )
    if ts.hours:
        return f"{ts.hours:.0f} hours {ts.minutes:.0f} minutes {ts.seconds} seconds"
    if ts.minutes:
        return f"{ts.minutes:.0f} minutes {ts.seconds} seconds"
    if ts.seconds:
        return f"{ts.seconds} seconds {ts.milliseconds:.0f} milliseconds"
    return f"{ts.total_microseconds} mircoseconds"


def format_timedelta_str(td: timedelta) -> str:
    """Format a timedelta object as a readable string."""
    return format_timespan_str(get_timespan(td))


def get_timespan(td: timedelta) -> timespan:
    """Convert timedelta object to timespan namedtuple."""
    (milliseconds, microseconds) = divmod(td.microseconds, 1000)
    (minutes, seconds) = divmod(td.seconds, 60)
    (hours, minutes) = divmod(minutes, 60)
    total_seconds = td.seconds + (td.days * ONE_DAY_IN_SECONDS)
    return timespan(
        td.days,
        hours,
        minutes,
        seconds,
        milliseconds,
        microseconds,
        total_seconds,
        (total_seconds * 1000 + milliseconds),
        (total_seconds * 1000 * 1000 + milliseconds * 1000 + microseconds),
    )
