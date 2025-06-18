from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import json
import base64

from ..core.database import get_db
from ..models.models import AssetDocument, DocumentTemplate, DocumentType, DocumentStatus, User, Asset
from .auth import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/documents", tags=["documents"])

# Pydantic models for request/response
class DocumentSignRequest(BaseModel):
    asset_id: int
    document_type: str
    form_data: dict
    signature: str  # Base64 encoded signature

class DocumentResponse(BaseModel):
    id: int
    asset_id: int
    document_type: str
    status: str
    created_at: datetime
    signed_at: Optional[datetime]
    
class DocumentTemplateResponse(BaseModel):
    id: int
    document_type: str
    template_name: str
    fields_schema: dict

@router.get("/templates", response_model=List[DocumentTemplateResponse])
async def get_document_templates(db: Session = Depends(get_db)):
    """Get all active document templates"""
    templates = db.query(DocumentTemplate).filter(DocumentTemplate.is_active == True).all()
    return [
        DocumentTemplateResponse(
            id=template.id,
            document_type=template.document_type.value,
            template_name=template.template_name,
            fields_schema=json.loads(template.fields_schema)
        ) for template in templates
    ]

@router.get("/templates/{document_type}")
async def get_document_template(
    document_type: str,
    db: Session = Depends(get_db)
):
    """Get specific document template with HTML content"""
    template = db.query(DocumentTemplate).filter(
        DocumentTemplate.document_type == DocumentType(document_type),
        DocumentTemplate.is_active == True
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    return {
        "id": template.id,
        "document_type": template.document_type.value,
        "template_name": template.template_name,
        "template_content": template.template_content,
        "fields_schema": json.loads(template.fields_schema),
        "version": template.version
    }

@router.post("/sign")
async def sign_document(
    request: DocumentSignRequest,
    http_request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Sign an electronic document"""
    
    # Verify asset exists and user has access
    asset = db.query(Asset).filter(Asset.id == request.asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Check if document already exists and is signed
    existing_doc = db.query(AssetDocument).filter(
        AssetDocument.asset_id == request.asset_id,
        AssetDocument.user_id == current_user.id,
        AssetDocument.document_type == DocumentType(request.document_type),
        AssetDocument.status == DocumentStatus.SIGNED
    ).first()
    
    if existing_doc:
        raise HTTPException(status_code=400, detail="Document already signed")
    
    # Create new document record
    document = AssetDocument(
        asset_id=request.asset_id,
        user_id=current_user.id,
        document_type=DocumentType(request.document_type),
        status=DocumentStatus.SIGNED,
        document_data=json.dumps(request.form_data),
        signature_data=request.signature,
        ip_address=http_request.client.host,
        user_agent=http_request.headers.get("user-agent", ""),
        signed_at=datetime.utcnow(),
        expires_at=datetime.utcnow() + timedelta(days=365)  # 1 year validity
    )
    
    db.add(document)
    db.commit()
    db.refresh(document)
    
    return {
        "message": "Document signed successfully",
        "document_id": document.id,
        "signed_at": document.signed_at
    }

@router.get("/asset/{asset_id}", response_model=List[DocumentResponse])
async def get_asset_documents(
    asset_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all documents for a specific asset"""
    documents = db.query(AssetDocument).filter(
        AssetDocument.asset_id == asset_id
    ).all()
    
    return [
        DocumentResponse(
            id=doc.id,
            asset_id=doc.asset_id,
            document_type=doc.document_type.value,
            status=doc.status.value,
            created_at=doc.created_at,
            signed_at=doc.signed_at
        ) for doc in documents
    ]

@router.get("/user/pending")
async def get_pending_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get pending documents for current user"""
    pending_docs = db.query(AssetDocument).filter(
        AssetDocument.user_id == current_user.id,
        AssetDocument.status == DocumentStatus.PENDING
    ).all()
    
    return [
        {
            "id": doc.id,
            "asset_id": doc.asset_id,
            "document_type": doc.document_type.value,
            "created_at": doc.created_at,
            "expires_at": doc.expires_at
        } for doc in pending_docs
    ]

@router.get("/user/{user_id}")
async def get_user_documents(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all documents for a specific user with template information"""
    # Users can only see their own documents, admins/managers can see any
    if current_user.id != user_id and current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    documents = db.query(AssetDocument).filter(
        AssetDocument.user_id == user_id
    ).all()
    
    # Get template information for document names
    templates = {t.document_type: t for t in db.query(DocumentTemplate).all()}
    
    return [
        {
            "id": doc.id,
            "asset_id": doc.asset_id,
            "document_type": doc.document_type.value,
            "status": doc.status.value,
            "created_at": doc.created_at,
            "signed_at": doc.signed_at,
            "expires_at": doc.expires_at,
            "template_name": templates.get(doc.document_type, {}).template_name if templates.get(doc.document_type) else f"Document {doc.document_type.value}"
        } for doc in documents
    ]

@router.post("/initiate/{asset_id}")
async def initiate_document_signing(
    asset_id: int,
    document_types: List[str],
    target_user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Initiate document signing process for asset issuance"""
    
    # Verify admin/manager permissions
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Verify asset exists
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Create pending documents
    created_docs = []
    for doc_type in document_types:
        document = AssetDocument(
            asset_id=asset_id,
            user_id=target_user_id,
            document_type=DocumentType(doc_type),
            status=DocumentStatus.PENDING,
            expires_at=datetime.utcnow() + timedelta(days=7)  # 7 days to sign
        )
        db.add(document)
        created_docs.append(doc_type)
    
    db.commit()
    
    return {
        "message": "Document signing initiated",
        "asset_id": asset_id,
        "documents_created": created_docs,
        "expires_in_days": 7
    } 