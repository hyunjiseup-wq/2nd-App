-- =============================================================
-- 맛담 - migration3: 프로필 사진(아바타)
-- Supabase 대시보드 → SQL Editor 에서 실행
-- =============================================================

-- 프로필 사진 URL 컬럼 추가
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- (사진은 기존 restaurant-photos 버킷의 <user_id>/avatar.* 경로에 저장되므로
--  별도 버킷/정책은 필요 없습니다.)
