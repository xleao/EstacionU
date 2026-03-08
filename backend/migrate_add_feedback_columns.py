"""
Migration script: Add feedback + reminder columns to 'citas' table.
Run this ONCE on the VPS after deploying the new code.

Usage (from the backend directory):
    python migrate_add_feedback_columns.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine
from sqlalchemy import text

columns_to_add = [
    ("se_dio_en_dia_acordado", "BOOLEAN"),
    ("calificacion_general", "INTEGER"),
    ("calificacion_utilidad", "INTEGER"),
    ("recomendaria_mentor", "BOOLEAN"),
    ("recordatorio_enviado", "BOOLEAN DEFAULT FALSE"),
]

with engine.connect() as conn:
    for col_name, col_type in columns_to_add:
        try:
            conn.execute(text(f"ALTER TABLE citas ADD COLUMN {col_name} {col_type}"))
            print(f"✅ Column '{col_name}' added successfully")
        except Exception as e:
            error_msg = str(e).lower()
            if "duplicate column" in error_msg or "already exists" in error_msg:
                print(f"⚠️  Column '{col_name}' already exists, skipping")
            else:
                print(f"❌ Error adding '{col_name}': {e}")
    
    conn.commit()
    print("\n🎉 Migration complete!")
