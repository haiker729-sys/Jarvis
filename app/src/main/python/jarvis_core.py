"""Small deterministic assistant utilities; never stores secrets."""
import re

def normalize_command(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").strip()).lower()

def classify_intent(text: str) -> str:
    value = normalize_command(text)
    if any(word in value for word in ("hello", "hi jarvis", "namaste")):
        return "greeting"
    if any(word in value for word in ("time", "samay")):
        return "time_query"
    if any(word in value for word in ("weather", "mausam")):
        return "weather_query"
    if any(word in value for word in ("call", "phone lagao")):
        return "call_request"
    return "general"
