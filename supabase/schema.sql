-- =============================================
-- 서울 맛집 리스트 - Supabase 스키마
-- Supabase 대시보드 > SQL Editor에서 실행하세요
-- =============================================

-- restaurants 테이블 생성
CREATE TABLE IF NOT EXISTS public.restaurants (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  area        TEXT,
  category    TEXT,
  address     TEXT,
  naver_map_url TEXT,
  tags        TEXT[],
  memo        TEXT,
  visited     BOOLEAN     NOT NULL DEFAULT FALSE,
  priority    INTEGER     NOT NULL DEFAULT 3,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 등록
DROP TRIGGER IF EXISTS restaurants_set_updated_at ON public.restaurants;
CREATE TRIGGER restaurants_set_updated_at
  BEFORE UPDATE ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS 비활성화 (개인 앱, 인증 없음)
ALTER TABLE public.restaurants DISABLE ROW LEVEL SECURITY;
