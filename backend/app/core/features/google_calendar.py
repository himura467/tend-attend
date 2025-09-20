from enum import Enum


class GoogleCalendarSyncStatus(str, Enum):
    DISCONNECTED = "disconnected"
    CONNECTED = "connected"
    SYNCING = "syncing"
    ERROR = "error"
