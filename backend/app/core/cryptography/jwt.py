from dataclasses import dataclass
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from jose import JWTError, jwt

from app.core.utils.uuid import UUID, generate_uuid, str_to_uuid, uuid_to_str


@dataclass(frozen=True)
class JWTCryptography:
    secret_key: str
    algorithm: str

    def _create_token(
        self,
        subject: UUID,
        expires_delta: timedelta,
    ) -> str:
        registered_claims = {
            "sub": uuid_to_str(subject),
            "iat": datetime.now(ZoneInfo("UTC")),
            "nbf": datetime.now(ZoneInfo("UTC")),
            "jti": uuid_to_str(generate_uuid()),
            "exp": datetime.now(ZoneInfo("UTC")) + expires_delta,
        }

        encoded_jwt: str = jwt.encode(
            claims=registered_claims,
            key=self.secret_key,
            algorithm=self.algorithm,
        )
        return encoded_jwt

    def create_session_token(self, subject: UUID, expires_delta: timedelta) -> str:
        return self._create_token(
            subject=subject,
            expires_delta=expires_delta,
        )

    def get_subject_from_session_token(self, session_token: str) -> UUID | None:
        try:
            payload = jwt.decode(session_token, self.secret_key, algorithms=[self.algorithm])
            sub_str = payload.get("sub")
            if not sub_str:
                return None
            subject: UUID = str_to_uuid(sub_str)
        except JWTError:
            return None
        return subject
