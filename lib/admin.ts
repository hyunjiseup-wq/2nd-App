// 관리자 이메일 목록 (여기에 추가하면 관리자 권한 부여)
export const ADMIN_EMAILS = ['hyunjiseup@gmail.com'];

export function isAdminEmail(email?: string | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}
