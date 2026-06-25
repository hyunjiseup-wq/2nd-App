-- =============================================
-- 서울 맛집 리스트 - 마이그레이션 (Supabase SQL Editor에서 실행)
-- =============================================

-- 1. 음식 사진 URL 컬럼 추가
ALTER TABLE public.seoul_restaurants ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. 개인별 방문 / 가고싶음 상태 테이블
CREATE TABLE IF NOT EXISTS public.user_restaurant_states (
  user_id     UUID    NOT NULL,
  restaurant_id TEXT  NOT NULL REFERENCES public.seoul_restaurants(id) ON DELETE CASCADE,
  visited     BOOLEAN NOT NULL DEFAULT FALSE,
  wishlist    BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, restaurant_id)
);
ALTER TABLE public.user_restaurant_states DISABLE ROW LEVEL SECURITY;

-- 3. 사용자 리뷰 테이블
CREATE TABLE IF NOT EXISTS public.restaurant_reviews (
  id            TEXT        PRIMARY KEY,
  restaurant_id TEXT        NOT NULL REFERENCES public.seoul_restaurants(id) ON DELETE CASCADE,
  user_id       UUID        NOT NULL,
  display_name  TEXT        NOT NULL DEFAULT '익명',
  rating        INTEGER     NOT NULL,
  content       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT rating_range CHECK (rating BETWEEN 1 AND 5),
  UNIQUE (user_id, restaurant_id)
);
ALTER TABLE public.restaurant_reviews DISABLE ROW LEVEL SECURITY;

-- 4. 앱 피드백 테이블
CREATE TABLE IF NOT EXISTS public.app_feedback (
  id           TEXT        PRIMARY KEY,
  user_id      UUID,
  display_name TEXT,
  type         TEXT        NOT NULL DEFAULT 'general',
  content      TEXT        NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.app_feedback DISABLE ROW LEVEL SECURITY;
