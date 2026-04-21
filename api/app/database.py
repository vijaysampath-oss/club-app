import os
from dotenv import load_dotenv
from sqlalchemy import create_engine

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is missing. Put it in api/.env")

# Neon uses SSL; your URL already includes sslmode=require
engine = create_engine(DATABASE_URL, pool_pre_ping=True)













































