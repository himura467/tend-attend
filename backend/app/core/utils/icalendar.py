import re
from datetime import datetime
from zoneinfo import ZoneInfo

from app.core.features.event import Frequency, Recurrence, RecurrenceRule, Weekday


def _parse_datetime_with_tzid(datetime_str: str, tzid: str | None) -> datetime:
    """Parse datetime string with optional TZID parameter."""
    if "T" in datetime_str:
        if datetime_str.endswith("Z"):
            # UTC time
            dt = datetime.strptime(datetime_str, "%Y%m%dT%H%M%SZ")
            return dt.replace(tzinfo=ZoneInfo("UTC"))
        else:
            # Local time with TZID
            dt = datetime.strptime(datetime_str, "%Y%m%dT%H%M%S")
            if tzid:
                return dt.replace(tzinfo=ZoneInfo(tzid))
            else:
                # Assume UTC if no timezone specified
                return dt.replace(tzinfo=ZoneInfo("UTC"))
    else:
        # Date-only format (all-day events)
        dt = datetime.strptime(datetime_str, "%Y%m%d")
        if tzid:
            return dt.replace(tzinfo=ZoneInfo(tzid))
        else:
            return dt.replace(tzinfo=ZoneInfo("UTC"))


def _parse_rdate_exdate_line(line: str, is_all_day: bool) -> list[datetime]:
    """Parse RDATE or EXDATE line with proper TZID handling."""
    # Extract TZID parameter if present
    tzid = None
    if ";TZID=" in line:
        parts = line.split(";")
        for part in parts[1:]:
            if part.startswith("TZID="):
                tzid = part[5:].split(":")[0]
                break

    # Extract the value part after the colon
    value_part = line.split(":")[1]

    return [_parse_datetime_with_tzid(dt_str, None if is_all_day else tzid) for dt_str in value_part.split(",")]


def parse_rrule(rrule_str: str, is_all_day: bool) -> RecurrenceRule:
    rrule_str = rrule_str.replace("RRULE:", "")
    rrules = dict(pair.split("=") for pair in rrule_str.split(";"))
    freq = Frequency(rrules["FREQ"])
    until: datetime | None = None
    count = int(rrules["COUNT"]) if "COUNT" in rrules else None
    if "UNTIL" in rrules:
        if count is not None:
            raise ValueError("RRULE cannot have both COUNT and UNTIL")
        until_str = rrules["UNTIL"]
        until = datetime.strptime(until_str, "%Y%m%d") if is_all_day else datetime.strptime(until_str, "%Y%m%dT%H%M%S")
    interval = int(rrules["INTERVAL"]) if "INTERVAL" in rrules else 1
    bysecond = list(map(int, rrules["BYSECOND"].split(","))) if "BYSECOND" in rrules else None
    byminute = list(map(int, rrules["BYMINUTE"].split(","))) if "BYMINUTE" in rrules else None
    byhour = list(map(int, rrules["BYHOUR"].split(","))) if "BYHOUR" in rrules else None
    byday = (
        [
            ((int(m.group(1)), Weekday(m.group(2))) if m.group(1) else (0, Weekday(m.group(2))))
            for m in re.finditer(r"(-?\d+)?(\w{2})", rrules["BYDAY"])
        ]
        if "BYDAY" in rrules
        else None
    )
    bymonthday = list(map(int, rrules["BYMONTHDAY"].split(","))) if "BYMONTHDAY" in rrules else None
    byyearday = list(map(int, rrules["BYYEARDAY"].split(","))) if "BYYEARDAY" in rrules else None
    byweekno = list(map(int, rrules["BYWEEKNO"].split(","))) if "BYWEEKNO" in rrules else None
    bymonth = list(map(int, rrules["BYMONTH"].split(","))) if "BYMONTH" in rrules else None
    bysetpos = list(map(int, rrules["BYSETPOS"].split(","))) if "BYSETPOS" in rrules else None
    wkst = Weekday(rrules["WKST"]) if "WKST" in rrules else None

    return RecurrenceRule(
        freq=freq,
        until=until,
        count=count,
        interval=interval,
        bysecond=bysecond,
        byminute=byminute,
        byhour=byhour,
        byday=byday,
        bymonthday=bymonthday,
        byyearday=byyearday,
        byweekno=byweekno,
        bymonth=bymonth,
        bysetpos=bysetpos,
        wkst=wkst,
    )


def parse_recurrence(recurrence_list: list[str], is_all_day: bool) -> Recurrence | None:
    rrule: RecurrenceRule | None = None
    rdate: list[datetime] = []
    exdate: list[datetime] = []

    if not recurrence_list:
        return None

    for rec in recurrence_list:
        if rec.startswith("RRULE:"):
            rrule = parse_rrule(rec, is_all_day)
        elif rec.startswith("RDATE"):
            rdate.extend(_parse_rdate_exdate_line(rec, is_all_day))
        elif rec.startswith("EXDATE"):
            exdate.extend(_parse_rdate_exdate_line(rec, is_all_day))

    if not rrule:
        raise ValueError("Missing RRULE in recurrence list")

    return Recurrence(rrule=rrule, rdate=rdate, exdate=exdate)


def serialize_recurrence(
    recurrence: Recurrence | None, dtstart: datetime, is_all_day: bool, timezone: str
) -> list[str]:
    if not recurrence:
        return []

    recurrence_list = []

    # Add DTSTART with TZID
    if is_all_day:
        dtstart_str = f"DTSTART;VALUE=DATE:{dtstart.strftime('%Y%m%d')}"
    else:
        dtstart_str = f"DTSTART;TZID={timezone}:{dtstart.strftime('%Y%m%dT%H%M%S')}"
    recurrence_list.append(dtstart_str)

    rrule_str = f"RRULE:FREQ={recurrence.rrule.freq.value}"
    if recurrence.rrule.until:
        rrule_str += f";UNTIL={recurrence.rrule.until.strftime('%Y%m%d') if is_all_day else recurrence.rrule.until.strftime('%Y%m%dT%H%M%S')}"
    if recurrence.rrule.count:
        rrule_str += f";COUNT={recurrence.rrule.count}"
    rrule_str += f";INTERVAL={recurrence.rrule.interval}"
    if recurrence.rrule.bysecond:
        rrule_str += f";BYSECOND={','.join(map(str, recurrence.rrule.bysecond))}"
    if recurrence.rrule.byminute:
        rrule_str += f";BYMINUTE={','.join(map(str, recurrence.rrule.byminute))}"
    if recurrence.rrule.byhour:
        rrule_str += f";BYHOUR={','.join(map(str, recurrence.rrule.byhour))}"
    if recurrence.rrule.byday:
        rrule_str += f";BYDAY={','.join(f'{byday[1].value}' if byday[0] == 0 else f'{byday[0]}{byday[1].value}' for byday in recurrence.rrule.byday)}"
    if recurrence.rrule.bymonthday:
        rrule_str += f";BYMONTHDAY={','.join(map(str, recurrence.rrule.bymonthday))}"
    if recurrence.rrule.byyearday:
        rrule_str += f";BYYEARDAY={','.join(map(str, recurrence.rrule.byyearday))}"
    if recurrence.rrule.byweekno:
        rrule_str += f";BYWEEKNO={','.join(map(str, recurrence.rrule.byweekno))}"
    if recurrence.rrule.bymonth:
        rrule_str += f";BYMONTH={','.join(map(str, recurrence.rrule.bymonth))}"
    if recurrence.rrule.bysetpos:
        rrule_str += f";BYSETPOS={','.join(map(str, recurrence.rrule.bysetpos))}"
    if recurrence.rrule.wkst:
        rrule_str += f";WKST={recurrence.rrule.wkst.value}"

    recurrence_list.append(rrule_str)
    if recurrence.rdate:
        if is_all_day:
            rdates = ",".join(rdate.strftime("%Y%m%d") for rdate in recurrence.rdate)
            rdate_str = f"RDATE;VALUE=DATE:{rdates}"
        else:
            rdates = ",".join(rdate.strftime("%Y%m%dT%H%M%S") for rdate in recurrence.rdate)
            rdate_str = f"RDATE;TZID={timezone}:{rdates}"
        recurrence_list.append(rdate_str)
    if recurrence.exdate:
        if is_all_day:
            exdates = ",".join(exdate.strftime("%Y%m%d") for exdate in recurrence.exdate)
            exdate_str = f"EXDATE;VALUE=DATE:{exdates}"
        else:
            exdates = ",".join(exdate.strftime("%Y%m%dT%H%M%S") for exdate in recurrence.exdate)
            exdate_str = f"EXDATE;TZID={timezone}:{exdates}"
        recurrence_list.append(exdate_str)

    return recurrence_list
