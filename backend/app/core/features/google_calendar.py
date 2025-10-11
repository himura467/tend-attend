from enum import Enum


class GoogleCalendarSyncStatus(str, Enum):
    DISCONNECTED = "disconnected"
    CONNECTED = "connected"
    SYNCING = "syncing"
    ERROR = "error"


def sanitize_rrule(rrule: str) -> str:
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
