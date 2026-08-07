import os
from slowapi import Limiter
from slowapi.util import get_remote_address

enabled = os.getenv("TESTING") != "true"
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"], enabled=enabled)
