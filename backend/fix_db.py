import sqlalchemy
from sqlalchemy import text
from app.database import engine

def run_sql(sql, success_msg, skip_msg):
    try:
        with engine.begin() as conn:
            conn.execute(text(sql))
        print(success_msg)
    except Exception as e:
        if "already exists" in str(e).lower() or "duplicate column" in str(e).lower() or "42701" in str(e).lower():
            print(skip_msg)
        else:
            print(f"ERROR: {e}")

if __name__ == "__main__":
    run_sql(
        "ALTER TABLE perfiles_mentor ADD COLUMN destacado BOOLEAN DEFAULT FALSE;",
        "Added 'destacado' column.",
        "Column 'destacado' already exists. Skipping."
    )
    run_sql(
        "ALTER TABLE perfiles_mentor ADD COLUMN bloqueado_destacado BOOLEAN DEFAULT FALSE;",
        "Added 'bloqueado_destacado' column.",
        "Column 'bloqueado_destacado' already exists. Skipping."
    )
    run_sql(
        "ALTER TABLE destacado_solicitudes ADD COLUMN notas_admin TEXT;",
        "Added 'notas_admin' column.",
        "Column 'notas_admin' already exists. Skipping."
    )
    print("Done!")
