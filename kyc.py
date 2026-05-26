"""
KYC (Know Your Customer) Document Upload and Verification Module
"""
import os
from datetime import datetime
from werkzeug.utils import secure_filename
from flask import current_app

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_kyc_folder(user_id):
    return os.path.join(current_app.config.get('UPLOAD_FOLDER', 'static/kyc'), str(user_id))

def save_kyc_document(user_id, document_type, file):
    """Save uploaded KYC document and return the file path"""
    if not file or not file.filename:
        return None, "No file provided"

    if not allowed_file(file.filename):
        return None, "Invalid file type. Allowed: PNG, JPG, JPEG, PDF"

    folder = get_kyc_folder(user_id)
    os.makedirs(folder, exist_ok=True)

    ext = file.filename.rsplit('.', 1)[1].lower()
    filename = f"{document_type}_{datetime.now().strftime('%Y%m%d%H%M%S')}.{ext}"
    filepath = os.path.join(folder, filename)

    file.save(filepath)

    relative_path = f"kyc/{user_id}/{filename}"
    return relative_path, None

def get_kyc_requirements():
    """Return required documents for KYC verification"""
    return [
        {'type': 'national_id_front', 'label': 'National ID (Front)', 'required': True},
        {'type': 'national_id_back', 'label': 'National ID (Back)', 'required': True},
        {'type': 'selfie', 'label': 'Selfie with ID', 'required': True},
        {'type': 'utility_bill', 'label': 'Proof of Address (Utility Bill)', 'required': False},
    ]

def is_kyc_complete(user_documents):
    """Check if user has submitted all required KYC documents"""
    if not user_documents:
        return False
    requirements = get_kyc_required_types()
    uploaded_types = {doc['document_type'] for doc in user_documents}
    return all(req in uploaded_types for req in requirements)

def get_kyc_required_types():
    return ['national_id_front', 'national_id_back', 'selfie']

def calculate_kyc_score(user_documents):
    """Calculate KYC completion score (0-100)"""
    if not user_documents:
        return 0

    all_types = ['national_id_front', 'national_id_back', 'selfie', 'utility_bill']
    uploaded = {doc['document_type'] for doc in user_documents if doc['status'] != 'rejected'}

    score = (len(uploaded & set(all_types)) / len(all_types)) * 100
    return min(int(score), 100)