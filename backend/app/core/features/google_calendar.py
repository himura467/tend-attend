from datetime import datetime
from enum import Enum
from zoneinfo import ZoneInfo


class GoogleCalendarSyncStatus(str, Enum):
    DISCONNECTED = "disconnected"
    CONNECTED = "connected"
    SYNCING = "syncing"
    ERROR = "error"


def _sanitize_rrule(rrule: str) -> str:
    """
    Sanitize RRULE to only include FREQ, UNTIL, COUNT and INTERVAL parameters.

    This project treats RRULE parameters like BYHOUR as representing values in the
    event's timezone. However, Google Calendar interprets these values as UTC and
    automatically converts them to the event's timezone, causing discrepancies with
    FullCalendar's display. This function strips out all parameters except the
    essential ones to ensure consistent behavior between FullCalendar and Google Calendar.

    Args:
        rrule: RRULE string (e.g., "RRULE:FREQ=WEEKLY;INTERVAL=2;COUNT=10;BYDAY=MO,WE")

    Returns:
        Sanitized RRULE string with only FREQ, UNTIL, COUNT and INTERVAL

    Raises:
        ValueError: If RRULE doesn't contain required FREQ parameter
    """
    if not rrule.startswith("RRULE:"):
        raise ValueError("RRULE must start with 'RRULE:' prefix")

    # Extract the part after "RRULE:"
    rrule_content = rrule[6:]

    # Parse all parameters
    params = {}
    for param in rrule_content.split(";"):
        if "=" in param:
            key, value = param.split("=", 1)
            params[key.strip()] = value.strip()

    # Only keep FREQ, UNTIL, COUNT and INTERVAL
    allowed_params = ["FREQ", "UNTIL", "COUNT", "INTERVAL"]
    sanitized_params = {k: v for k, v in params.items() if k in allowed_params}

    # FREQ is required
    if "FREQ" not in sanitized_params:
        raise ValueError("RRULE must contain FREQ parameter")

    # Reconstruct RRULE with only allowed parameters
    # Order: FREQ first, then UNTIL, then COUNT, then INTERVAL
    result_parts = [f"FREQ={sanitized_params['FREQ']}"]
    if "UNTIL" in sanitized_params:
        result_parts.append(f"UNTIL={sanitized_params['UNTIL']}")
    if "COUNT" in sanitized_params:
        result_parts.append(f"COUNT={sanitized_params['COUNT']}")
    if "INTERVAL" in sanitized_params:
        result_parts.append(f"INTERVAL={sanitized_params['INTERVAL']}")

    return f"RRULE:{';'.join(result_parts)}"


def _sanitize_date_rule(date_rule: str) -> str:
    """
    Sanitize RDATE or EXDATE by removing TZID and converting to UTC.

    Args:
        date_rule: RDATE or EXDATE string (e.g., "RDATE;TZID=Asia/Tokyo:20251013T173000")

    Returns:
        Sanitized date rule in UTC format (e.g., "RDATE:20251013T083000Z")
    """
    # Split on colon to separate prefix from datetime value
    parts = date_rule.split(":", 1)
    if len(parts) != 2:
        # No colon found, return as-is
        return date_rule

    prefix_part, datetime_value = parts

    # Determine the rule type (RDATE or EXDATE)
    rule_type = prefix_part.split(";")[0]

    # Extract timezone if present
    timezone_str = None
    if "TZID=" in prefix_part:
        # Extract timezone from TZID parameter
        for param in prefix_part.split(";"):
            if param.startswith("TZID="):
                timezone_str = param.split("=", 1)[1]
                break

    # Parse the datetime value
    try:
        if timezone_str:
            # Parse datetime with timezone and convert to UTC
            dt_format = "%Y%m%dT%H%M%S"
            dt = datetime.strptime(datetime_value, dt_format)
            dt_with_tz = dt.replace(tzinfo=ZoneInfo(timezone_str))
            dt_utc = dt_with_tz.astimezone(ZoneInfo("UTC"))

            # Format as UTC datetime
            utc_datetime = dt_utc.strftime("%Y%m%dT%H%M%SZ")
        else:
            # No timezone specified, assume it's already in correct format
            # Just ensure it has Z suffix if it's a datetime
            if "T" in datetime_value and not datetime_value.endswith("Z"):
                utc_datetime = f"{datetime_value}Z"
            else:
                utc_datetime = datetime_value

        return f"{rule_type}:{utc_datetime}"
    except (ValueError, KeyError):
        # If parsing fails, return original rule
        return date_rule


def sanitize_recurrence(recurrence: list[str]) -> list[str]:
    """
    Sanitize recurrence rules for Google Calendar API.

    This function processes a list of recurrence rule strings:
    - Removes any elements starting with DTSTART
    - For RRULE elements, strips out all parameters except FREQ, UNTIL, COUNT and INTERVAL
    - For RDATE and EXDATE, removes TZID parameter and converts to UTC

    Args:
        recurrence: List of recurrence rule strings (e.g., ["RRULE:...", "RDATE;TZID=..."])

    Returns:
        Sanitized list of recurrence rule strings

    Example:
        >>> sanitize_recurrence([
        ...     "DTSTART;TZID=Asia/Tokyo:20251017T083000",
        ...     "RRULE:FREQ=WEEKLY;BYDAY=MO,WE",
        ...     "RDATE;TZID=Asia/Tokyo:20251013T173000"
        ... ])
        ["RRULE:FREQ=WEEKLY", "RDATE:20251013T083000Z"]
    """
    sanitized = []

    for rule in recurrence:
        # Skip DTSTART entries
        if rule.startswith("DTSTART"):
            continue

        # Process RRULE entries
        if rule.startswith("RRULE:"):
            sanitized.append(_sanitize_rrule(rule))
            continue

        # Process RDATE and EXDATE entries
        if rule.startswith("RDATE") or rule.startswith("EXDATE"):
            sanitized.append(_sanitize_date_rule(rule))
            continue

        # Keep other entries as-is
        sanitized.append(rule)

    return sanitized
