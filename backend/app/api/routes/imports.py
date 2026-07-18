from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.repositories.transaction_repository import TransactionRepository
from app.schemas.import_result import ImportResultResponse
from app.services.imports.service import ImportService, UnsupportedFileFormatError

router = APIRouter(prefix="/imports", tags=["imports"])


def get_import_service(db: Session = Depends(get_db)) -> ImportService:
    return ImportService(TransactionRepository(db))


@router.post("", response_model=ImportResultResponse, status_code=status.HTTP_201_CREATED)
async def import_file(
    file: UploadFile = File(...),
    service: ImportService = Depends(get_import_service),
) -> ImportResultResponse:
    content = await file.read()
    if not content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="ファイルが空です")

    try:
        result = service.import_file(file.filename or "upload", content)
    except UnsupportedFileFormatError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)
        ) from exc

    return ImportResultResponse(
        source_format=result.source_format,
        registered_count=result.registered_count,
        duplicate_count=result.duplicate_count,
        error_count=result.error_count,
        errors=result.errors,
    )
