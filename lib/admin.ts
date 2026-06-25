// 아이디로 가입할 때 내부적으로 붙이는 도메인 (사용자에겐 안 보임)
export const ID_EMAIL_DOMAIN = 'seoulmatjip.app';

// 입력값을 Supabase용 이메일로 변환
// - 이메일 형태(@ 포함)면 그대로 사용
// - 아이디면 도메인을 붙여 가짜 이메일 생성 (예: foodmaster -> foodmaster@seoulmatjip.app)
export function emailFromId(input: string): string {
  const v = input.trim().toLowerCase();
  return v.includes('@') ? v : `${v}@${ID_EMAIL_DOMAIN}`;
}

// 관리자 식별 (실제 이메일 또는 아이디 기반 이메일 모두 허용)
export const ADMIN_EMAILS = ['hyunjiseup@gmail.com', `hyunjiseup@${ID_EMAIL_DOMAIN}`];

export function isAdminEmail(email?: string | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}
