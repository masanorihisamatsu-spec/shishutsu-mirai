import logging

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.schemas.ocr import OcrReceiptResult
from app.services.ocr import OcrProcessingError, OcrService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ocr", tags=["ocr"])

_ocr_service = OcrService()


def get_ocr_service() -> OcrService:
    return _ocr_service


@router.post("/receipts", response_model=OcrReceiptResult)
async def scan_receipt(
    file: UploadFile = File(...),
    service: OcrService = Depends(get_ocr_service),
) -> OcrReceiptResult:
    # 診断用ログ（一時的）: 本番でスマホ等からのリクエストが実際にbackendまで到達しているかを、
    # OCR処理ロジック（app.services.ocr.* のINFOログ）とは独立に確認するためのもの。
    # WARNINGレベルにしているのは、alembic.iniのroot logger設定（level=WARNING）の影響を
    # 受けず、ロガー設定の状態に関わらず必ず出力されるようにするため。
    logger.warning(
        "OCR API DEBUG: received filename=%s content_type=%s",
        file.filename,
        file.content_type,
    )

    content = await file.read()
    if not content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="画像が空です")

    logger.warning("OCR API DEBUG: content size=%d bytes", len(content))

    try:
        result = service.process_receipt(file.filename or "receipt.jpg", content)
    except OcrProcessingError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)
        ) from exc

    return OcrReceiptResult(
        store_name=result.store_name,
        date=result.date,
        amount=result.amount,
        payment_method=result.payment_method,
        receipt_image=result.receipt_image,
        raw_text=result.raw_text,
    )
