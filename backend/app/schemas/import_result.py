from pydantic import BaseModel, Field


class ImportResultResponse(BaseModel):
    source_format: str = Field(description="自動判定されたファイル形式")
    registered_count: int = Field(description="新規登録した件数")
    duplicate_count: int = Field(description="重複のため登録しなかった件数")
    error_count: int = Field(description="パース/登録に失敗した件数")
    errors: list[str] = Field(default_factory=list, description="エラー内容（行番号+理由）")
