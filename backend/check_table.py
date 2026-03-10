import traceback
from app.database import engine
from sqlalchemy import text

def run_check():
    with engine.connect() as conn:
        try:
            result = conn.execute(text("SELECT data_type FROM information_schema.columns WHERE table_name = 'citas' AND column_name = 'recomendaria_mentor';"))
            for row in result:
                print(f"Data type: {row[0]}")
        except Exception as e:
            print(f"Error checking: {repr(e)}")

if __name__ == "__main__":
    run_check()
