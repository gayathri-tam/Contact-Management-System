from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field, EmailStr
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from pymongo import MongoClient, ReturnDocument
from dotenv import load_dotenv
import os
import secrets


# Load .env FIRST
load_dotenv()


app = FastAPI()


# =========================
# HTTP BASIC AUTHENTICATION
# =========================

security = HTTPBasic()

AUTH_USERNAME = os.getenv("AUTH_USERNAME")
AUTH_PASSWORD = os.getenv("AUTH_PASSWORD")

if not AUTH_USERNAME or not AUTH_PASSWORD:
    raise RuntimeError(
        "AUTH_USERNAME or AUTH_PASSWORD environment variable is not set"
    )


def authenticate(
    credentials: HTTPBasicCredentials = Depends(security)
):
    correct_username = secrets.compare_digest(
        credentials.username,
        AUTH_USERNAME
    )

    correct_password = secrets.compare_digest(
        credentials.password,
        AUTH_PASSWORD
    )

    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Basic"},
        )

    return credentials.username


# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# MONGODB CONNECTION
# =========================

MONGODB_URL = os.getenv("MONGODB_URL")

if not MONGODB_URL:
    raise RuntimeError(
        "MONGODB_URL environment variable is not set"
    )


client = MongoClient(MONGODB_URL)

db = client["contacts_db"]

contacts_collection = db["contacts"]

counters_collection = db["counters"]


# =========================
# CONTACT MODEL
# =========================

class Contact(BaseModel):
    first_name: str = Field(
        pattern=r"^[a-z]+$"
    )

    last_name: str = Field(
        pattern=r"^[a-z]+$"
    )

    email: EmailStr

    contact_number: str = Field(
        pattern=r"^[0-9]+$"
    )


# =========================
# HOME
# =========================

@app.get("/")
def home():
    return {
        "message": "Contact API is running"
    }


# =========================
# CREATE
# =========================

@app.post("/contacts")
def create_contact(
    contact: Contact,
    username: str = Depends(authenticate)
):

    counter = counters_collection.find_one_and_update(
        {"_id": "contact_id"},
        {"$inc": {"sequence": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER
    )

    new_id = counter["sequence"]

    new_contact = {
        "id": new_id,
        "first_name": contact.first_name,
        "last_name": contact.last_name,
        "email": str(contact.email),
        "contact_number": contact.contact_number
    }

    contacts_collection.insert_one(new_contact)

    return {
        "message": "Contact created successfully",
        "contact": new_contact
    }


# =========================
# READ ALL
# =========================

@app.get("/contacts")
def get_contacts(
    username: str = Depends(authenticate)
):

    contacts = list(
        contacts_collection.find(
            {},
            {"_id": 0}
        )
    )

    return contacts


# =========================
# READ ONE
# =========================

@app.get("/contacts/{contact_id}")
def get_contact(
    contact_id: int,
    username: str = Depends(authenticate)
):

    contact = contacts_collection.find_one(
        {"id": contact_id},
        {"_id": 0}
    )

    if contact:
        return contact

    raise HTTPException(
        status_code=404,
        detail="Contact not found"
    )


# =========================
# UPDATE
# =========================

@app.put("/contacts/{contact_id}")
def update_contact(
    contact_id: int,
    contact: Contact,
    username: str = Depends(authenticate)
):

    updated_contact = contacts_collection.find_one_and_update(
        {"id": contact_id},
        {
            "$set": {
                "first_name": contact.first_name,
                "last_name": contact.last_name,
                "email": str(contact.email),
                "contact_number": contact.contact_number
            }
        },
        return_document=ReturnDocument.AFTER
    )

    if updated_contact:

        updated_contact.pop("_id", None)

        return {
            "message": "Contact updated successfully",
            "contact": updated_contact
        }

    raise HTTPException(
        status_code=404,
        detail="Contact not found"
    )


# =========================
# DELETE
# =========================

@app.delete("/contacts/{contact_id}")
def delete_contact(
    contact_id: int,
    username: str = Depends(authenticate)
):

    result = contacts_collection.delete_one(
        {"id": contact_id}
    )

    if result.deleted_count == 1:

        return {
            "message": "Contact deleted successfully"
        }

    raise HTTPException(
        status_code=404,
        detail="Contact not found"
    )






