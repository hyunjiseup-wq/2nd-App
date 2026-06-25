-- =============================================
-- 서울 맛집 리스트 - 개인 리스트 모델 마이그레이션
-- Supabase 대시보드 > SQL Editor 에서 전체 실행하세요
-- =============================================

-- 1. seoul_restaurants: 개인 소유 모델로 확장
ALTER TABLE public.seoul_restaurants ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.seoul_restaurants ADD COLUMN IF NOT EXISTS wishlist BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.seoul_restaurants ADD COLUMN IF NOT EXISTS owner_id UUID;

CREATE INDEX IF NOT EXISTS idx_seoul_restaurants_owner
  ON public.seoul_restaurants(owner_id);

-- 2. profiles: 사용자 목록 (다른 사람 리스트 둘러보기용)
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID        PRIMARY KEY,
  display_name TEXT        NOT NULL DEFAULT '사용자',
  is_admin     BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 3. 리뷰
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

-- 4. 앱 피드백
CREATE TABLE IF NOT EXISTS public.app_feedback (
  id           TEXT        PRIMARY KEY,
  user_id      UUID,
  display_name TEXT,
  type         TEXT        NOT NULL DEFAULT 'general',
  content      TEXT        NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.app_feedback DISABLE ROW LEVEL SECURITY;

-- 5. 더 이상 사용하지 않는 테이블 정리 (이전 버전에서 만들었다면 제거)
DROP TABLE IF EXISTS public.user_restaurant_states;
