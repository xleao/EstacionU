from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int
    
    # SMTP Config
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = "TUCORREO@gmail.com"
    smtp_password: str = "TUCONTRASEÑA_DE_APP"
    smtp_from_name: str = "EstacionU+"
    google_client_id: str = ""

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
