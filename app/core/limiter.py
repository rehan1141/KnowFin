import os
import sys
from slowapi import Limiter
from slowapi.util import get_remote_address

is_testing = os.getenv("TESTING") == "true" or "pytest" in sys.modules
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100/minute"],
    enabled=not is_testing,
)
