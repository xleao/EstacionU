import sqlalchemy
from sqlalchemy import text
from app.database import engine

def fix_database():
    with engine.begin() as conn:
        print("Checking/Adding 'destacado' to perfiles_mentor...")
        try:
            conn.execute(text("ALTER TABLE perfiles_mentor ADD COLUMN destacado BOOLEAN DEFAULT FALSE;"))
            print("Successfully added 'destacado' column.")
        except sqlalchemy.exc.OperationalError as e:
            if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
                print("Column 'destacado' already exists. Skipping.")
            else:
                print(f"Error adding 'destacado': {e}")
                
        print("Checking/Adding 'bloqueado_destacado' to perfiles_mentor...")
        try:
            conn.execute(text("ALTER TABLE perfiles_mentor ADD COLUMN bloqueado_destacado BOOLEAN DEFAULT FALSE;"))
            print("Successfully added 'bloqueado_destacado' column.")
        except sqlalchemy.exc.OperationalError as e:
            if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
                print("Column 'bloqueado_destacado' already exists. Skipping.")
            else:
                print(f"Error adding 'bloqueado_destacado': {e}")
                
if __name__ == "__main__":
    fix_database()
