#!/usr/bin/env python3
"""
Initialize document templates for ITAM system
This script creates the HTML templates and field schemas for the three Foxconn forms
"""

import json
from sqlalchemy.orm import Session
from database import SessionLocal
from models.asset import DocumentTemplate, DocumentType

def create_declaration_form_template():
    """Create Declaration Form for Holding Company IT Asset template"""
    html_content = """
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: white;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #3B82F6; margin-bottom: 10px;">FOXCONN</h2>
            <h3 style="color: white; margin-bottom: 5px;">BUSINESS OPERATING PROCEDURE</h3>
            <p style="color: #CBD5E0; font-size: 14px;">This procedure applies to Foxconn Singapore group of entities</p>
            <div style="text-align: right; margin-top: 20px;">
                <p style="color: #CBD5E0; font-size: 12px;">DOCUMENT NO: P14-Form 2</p>
                <p style="color: #CBD5E0; font-size: 12px;">PAGE: 1 of 1</p>
            </div>
        </div>
        
        <h3 style="text-align: center; color: white; margin: 30px 0;">Declaration Form for Holding Company IT Asset</h3>
        
        <p style="color: white; margin: 20px 0;">I hereby acknowledge receipt or assignment of the following Company device property</p>
        
        <div style="margin: 30px 0;">
            <p style="color: white; margin-bottom: 20px;"><strong>Acknowledgement:</strong> I have received the above mentioned assets. I understand that this asset belongs to Foxconn Singapore Group and is under my possession for carrying out my office work. I hereby declare that I will adhere to Company policies and regulations on use and return of IT assets upon my employment period.</p>
        </div>
        
        <div style="margin-top: 40px; color: #CBD5E0; font-size: 12px; text-align: center;">
            <p>This is an electronic document. Your digital signature will be legally binding.</p>
        </div>
    </div>
    """
    
    fields_schema = [
        {"name": "device_type", "label": "Device Type", "type": "text", "required": True},
        {"name": "device_model", "label": "Device Model", "type": "text", "required": True},
        {"name": "asset_tag", "label": "Asset Tag", "type": "text", "required": True},
        {"name": "serial_number", "label": "Serial Number", "type": "text", "required": True},
        {"name": "employee_name", "label": "Employee Name", "type": "text", "required": True},
        {"name": "employee_id", "label": "Employee ID", "type": "text", "required": True},
        {"name": "department", "label": "Department", "type": "text", "required": True},
        {"name": "acknowledgement_date", "label": "Date", "type": "date", "required": True}
    ]
    
    return DocumentTemplate(
        document_type=DocumentType.DECLARATION_FORM,
        template_name="Declaration Form for Holding Company IT Asset",
        template_content=html_content,
        fields_schema=json.dumps(fields_schema),
        is_active=True,
        version="1.0"
    )

def create_it_orientation_template():
    """Create IT Orientation Acknowledgment Form template"""
    html_content = """
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: white;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #3B82F6; margin-bottom: 10px;">FOXCONN</h2>
            <h3 style="color: white; margin-bottom: 5px;">BUSINESS OPERATING PROCEDURE</h3>
            <p style="color: #CBD5E0; font-size: 14px;">This procedure applies to Foxconn Singapore group of entities</p>
            <div style="text-align: right; margin-top: 20px;">
                <p style="color: #CBD5E0; font-size: 12px;">DOCUMENT NO: P14-Form 3</p>
                <p style="color: #CBD5E0; font-size: 12px;">PAGE: 1 of 1</p>
            </div>
        </div>
        
        <h3 style="text-align: center; color: white; margin: 30px 0;">IT Orientation Acknowledgment Form</h3>
        
        <p style="color: white; margin: 20px 0;">From IT Orientation, I have learned the following topics:</p>
        
        <div style="margin: 30px 0;">
            <div style="margin: 15px 0; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 5px;">
                <p style="color: white; margin: 5px 0;">1. Computer login account expiration practice</p>
                <p style="color: white; margin: 5px 0;">2. Email account protection practice</p>
                <p style="color: white; margin: 5px 0;">3. Software installation request control</p>
                <p style="color: white; margin: 5px 0;">4. Portable storage device control</p>
                <p style="color: white; margin: 5px 0;">5. Workstation screen lock out practice</p>
                <p style="color: white; margin: 5px 0;">6. Malwares safety practice</p>
                <p style="color: white; margin: 5px 0;">7. Email security best practice</p>
            </div>
        </div>
        
        <div style="margin-top: 40px; color: #CBD5E0; font-size: 12px; text-align: center;">
            <p>This is an electronic document. Your digital signature confirms completion of IT orientation.</p>
        </div>
    </div>
    """
    
    fields_schema = [
        {"name": "employee_name", "label": "Employee Name", "type": "text", "required": True},
        {"name": "employee_id", "label": "Employee ID", "type": "text", "required": True},
        {"name": "completion_date", "label": "Date of Completion", "type": "date", "required": True},
        {"name": "login_practice", "label": "Computer login account expiration practice", "type": "checkbox", "required": True},
        {"name": "email_protection", "label": "Email account protection practice", "type": "checkbox", "required": True},
        {"name": "software_control", "label": "Software installation request control", "type": "checkbox", "required": True},
        {"name": "storage_control", "label": "Portable storage device control", "type": "checkbox", "required": True},
        {"name": "screen_lock", "label": "Workstation screen lock out practice", "type": "checkbox", "required": True},
        {"name": "malware_safety", "label": "Malwares safety practice", "type": "checkbox", "required": True},
        {"name": "email_security", "label": "Email security best practice", "type": "checkbox", "required": True}
    ]
    
    return DocumentTemplate(
        document_type=DocumentType.IT_ORIENTATION,
        template_name="IT Orientation Acknowledgment Form",
        template_content=html_content,
        fields_schema=json.dumps(fields_schema),
        is_active=True,
        version="1.0"
    )

def create_handover_form_template():
    """Create Equipment Takeover/Handover Form template"""
    html_content = """
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: white;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #3B82F6; margin-bottom: 10px;">FOXCONN</h2>
            <h3 style="color: white; margin-bottom: 5px;">BUSINESS OPERATING PROCEDURE</h3>
            <p style="color: #CBD5E0; font-size: 14px;">This procedure applies to Foxconn Singapore group of entities</p>
            <div style="text-align: right; margin-top: 20px;">
                <p style="color: #CBD5E0; font-size: 12px;">DOCUMENT NO: P14-Form 1</p>
                <p style="color: #CBD5E0; font-size: 12px;">PAGE: 1 of 1</p>
            </div>
        </div>
        
        <h3 style="text-align: center; color: white; margin: 30px 0;">Equipment Takeover / Handover Form</h3>
        
        <p style="color: white; margin: 20px 0;"><strong>Objective:</strong> To ensure that the item(s) collected / returned are handed over correctly and acknowledged</p>
        
        <div style="margin: 30px 0;">
            <h4 style="color: #3B82F6; margin-bottom: 15px;">Accessories Checklist</h4>
            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 5px;">
                <p style="color: white; margin: 5px 0;">✓ Charger</p>
                <p style="color: white; margin: 5px 0;">✓ Mouse</p>
                <p style="color: white; margin: 5px 0;">✓ Keyboard</p>
                <p style="color: white; margin: 5px 0;">✓ Thumb Drive</p>
                <p style="color: white; margin: 5px 0;">✓ CD/DVD</p>
                <p style="color: white; margin: 5px 0;">✓ Laptop Bag</p>
            </div>
        </div>
        
        <div style="margin: 30px 0;">
            <h4 style="color: #3B82F6; margin-bottom: 15px;">Acknowledgement Section</h4>
            <p style="color: white;">We have checked and verified that above items are collected/returned</p>
        </div>
        
        <div style="margin-top: 40px; color: #CBD5E0; font-size: 12px; text-align: center;">
            <p>This is an electronic document for equipment handover/takeover process.</p>
        </div>
    </div>
    """
    
    fields_schema = [
        {"name": "staff_name", "label": "Staff Name", "type": "text", "required": True},
        {"name": "dept_location", "label": "Department/Location", "type": "text", "required": True},
        {"name": "email", "label": "Email", "type": "email", "required": True},
        {"name": "emp_id", "label": "Employee ID", "type": "text", "required": True},
        {"name": "contact", "label": "Contact", "type": "text", "required": True},
        {"name": "device_type", "label": "Device Type", "type": "text", "required": True},
        {"name": "device_model", "label": "Device Model", "type": "text", "required": True},
        {"name": "asset_number", "label": "Asset Number", "type": "text", "required": True},
        {"name": "serial_number", "label": "Serial Number", "type": "text", "required": True},
        {"name": "operation_type", "label": "Operation Type (Issue/Return/Transfer/Replacement)", "type": "text", "required": True},
        {"name": "charger", "label": "Charger", "type": "checkbox", "required": False},
        {"name": "mouse", "label": "Mouse", "type": "checkbox", "required": False},
        {"name": "keyboard", "label": "Keyboard", "type": "checkbox", "required": False},
        {"name": "thumb_drive", "label": "Thumb Drive", "type": "checkbox", "required": False},
        {"name": "cd_dvd", "label": "CD/DVD", "type": "checkbox", "required": False},
        {"name": "laptop_bag", "label": "Laptop Bag", "type": "checkbox", "required": False},
        {"name": "handover_date", "label": "Handover Date", "type": "date", "required": True},
        {"name": "takeover_date", "label": "Takeover Date", "type": "date", "required": True}
    ]
    
    return DocumentTemplate(
        document_type=DocumentType.HANDOVER_FORM,
        template_name="Equipment Takeover/Handover Form",
        template_content=html_content,
        fields_schema=json.dumps(fields_schema),
        is_active=True,
        version="1.0"
    )

def init_document_templates():
    """Initialize all document templates"""
    db = SessionLocal()
    try:
        # Check if templates already exist
        existing_templates = db.query(DocumentTemplate).count()
        if existing_templates > 0:
            print(f"Found {existing_templates} existing templates. Skipping initialization.")
            return
        
        # Create templates
        templates = [
            create_declaration_form_template(),
            create_it_orientation_template(),
            create_handover_form_template()
        ]
        
        for template in templates:
            db.add(template)
        
        db.commit()
        print("✅ Document templates initialized successfully!")
        print(f"Created {len(templates)} templates:")
        for template in templates:
            print(f"  - {template.template_name} ({template.document_type.value})")
            
    except Exception as e:
        db.rollback()
        print(f"❌ Error initializing templates: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_document_templates() 