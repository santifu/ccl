import os
from dotenv import load_dotenv

# load_dotenv()  # Carga las variables desde .env
load_dotenv(dotenv_path=".env")


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

print("URL:", SUPABASE_URL)
print("KEY:", SUPABASE_ANON_KEY)