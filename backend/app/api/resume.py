from fastapi import APIRouter, UploadFile, File, HTTPException
import io
import os

router = APIRouter()

def extract_pdf(file_bytes: bytes) -> str:
    import pdfplumber
    text = ""
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text.strip()

def extract_docx(file_bytes: bytes) -> str:
    from docx import Document
    doc = Document(io.BytesIO(file_bytes))
    return "\n".join([para.text for para in doc.paragraphs if para.text.strip()])

def extract_image(file_bytes: bytes) -> str:
    try:
        import pytesseract
        from PIL import Image
        # Set tesseract path for Windows
        if os.name == 'nt':
            pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
        img = Image.open(io.BytesIO(file_bytes))
        return pytesseract.image_to_string(img)
    except Exception as e:
        return f"[Image OCR failed: {str(e)}]"

@router.post("/extract-text")
async def extract_resume_text(file: UploadFile = File(...)):
    content = await file.read()
    filename = file.filename.lower()
    text = ""

    try:
        if filename.endswith(".pdf"):
            text = extract_pdf(content)
        elif filename.endswith(".docx"):
            text = extract_docx(content)
        elif filename.endswith(".doc"):
            text = extract_docx(content)
        elif filename.endswith((".png", ".jpg", ".jpeg")):
            text = extract_image(content)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type")

        if not text.strip():
            raise HTTPException(status_code=422, detail="Could not extract text from file")

        return {"text": text[:5000], "chars": len(text)}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")