import json
import logging
import uuid
from datetime import datetime, timedelta

try:
    from routes.connection import redis_client
except Exception:
    redis_client = None

logger = logging.getLogger(__name__)

class SessionManager:
    def __init__(self):
        self.sessions = {}
        self.cleanup_interval = timedelta(hours=1)  # Clean sessions older than 1 hour
        self.redis_prefix = "chat_session:"

    def _redis_key(self, session_id):
        return f"{self.redis_prefix}{session_id}"

    def _default_session_payload(self):
        now = datetime.now().isoformat()
        return {
            "created_at": now,
            "updated_at": now,
            "states": {
                "destination": None,
                "origin": None,
                "days": None,
                "mood": None,
                "route": None,
            },
            "current_step": "destination",
            "system_message": []
        }

    def _store_session(self, session_id, payload):
        payload["updated_at"] = datetime.now().isoformat()
        self.sessions[session_id] = payload
        if redis_client is not None:
            try:
                redis_client.setex(
                    self._redis_key(session_id),
                    int(self.cleanup_interval.total_seconds()),
                    json.dumps(payload),
                )
            except Exception:
                logger.exception("Failed to persist session %s to Redis", session_id)

    def create_session(self):
        """Create a new session with unique ID"""
        session_id = str(uuid.uuid4())
        self._store_session(session_id, self._default_session_payload())
        logger.info("Created chat session %s", session_id)
        return session_id

    def get_session(self, session_id):
        """Get session data if exists and not expired"""
        self.cleanup_old_sessions()
        session = self.sessions.get(session_id)
        if session:
            self._store_session(session_id, session)
            return session

        if redis_client is None or not session_id:
            return None

        try:
            cached_session = redis_client.get(self._redis_key(session_id))
        except Exception:
            logger.exception("Failed to fetch session %s from Redis", session_id)
            return None

        if not cached_session:
            return None

        if isinstance(cached_session, bytes):
            cached_session = cached_session.decode("utf-8")

        session = json.loads(cached_session)
        self._store_session(session_id, session)
        return session

    def save_session(self, session_id, session_data):
        """Persist session updates to memory and Redis"""
        self._store_session(session_id, session_data)

    def delete_session(self, session_id):
        self.sessions.pop(session_id, None)
        if redis_client is not None and session_id:
            try:
                redis_client.delete(self._redis_key(session_id))
            except Exception:
                logger.exception("Failed to delete session %s from Redis", session_id)
        logger.info("Deleted chat session %s", session_id)

    def cleanup_old_sessions(self):
        """Remove expired sessions"""
        current_time = datetime.now()
        expired_sessions = [
            sid for sid, data in self.sessions.items()
            if self._session_age_exceeded(current_time, data)
        ]
        for sid in expired_sessions:
            del self.sessions[sid]

    def _session_age_exceeded(self, current_time, data):
        created_at = data.get("updated_at") or data.get("created_at")
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)
        return current_time - created_at > self.cleanup_interval
