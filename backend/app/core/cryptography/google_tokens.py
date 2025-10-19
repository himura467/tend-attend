from dataclasses import dataclass, field

from cryptography.fernet import Fernet


@dataclass(frozen=True)
class GoogleTokenCryptography:
    encryption_key: str
    _fernet: Fernet = field(init=False)

    def __post_init__(self) -> None:
        # Create Fernet instance once during initialization
        try:
            fernet = Fernet(self.encryption_key.encode())
            object.__setattr__(self, "_fernet", fernet)
        except Exception as e:
            raise ValueError(f"Invalid encryption key format: {e}")

    def encrypt_token(self, token: str) -> str:
        """Encrypt a Google API token for secure storage."""
        encrypted_token = self._fernet.encrypt(token.encode())
        return encrypted_token.decode()

    def decrypt_token(self, encrypted_token: str) -> str:
        """Decrypt a Google API token for use."""
        decrypted_token = self._fernet.decrypt(encrypted_token.encode())
        return decrypted_token.decode()
