import traceback
from app.database import engine
from sqlalchemy import text

def run_migration():
    with engine.connect() as conn:
        print("Starting migration...")
        tables = ["appointments", "citas", "citas_mentoria", "citas_mentorias"]
        
        for table in tables:
            try:
                conn.execute(text(f"ALTER TABLE {table} ALTER COLUMN recomendaria_mentor TYPE INT USING recomendaria_mentor::integer;"))
                conn.commit()
                print(f"Successfully migrated {table}")
            except Exception as e:
                print(f"Error migrating {table}: {repr(e)}")
                conn.rollback()

if __name__ == "__main__":
    run_migration()
