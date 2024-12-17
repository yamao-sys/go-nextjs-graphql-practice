import { NextResponse, type NextRequest } from 'next/server';
import { checkSignedIn } from './actions/checkSignedIn';

const needsAuthPath = ['/todos'];

const needsAuth = (path: string) =>
  needsAuthPath.some((pathPattern) => path.startsWith(pathPattern));

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // NOTE: ミドルウェアによるチェックが不要なページは、認証チェックなど不要なチェック処理が入ることを防ぐため、早期リターン
  if (!needsAuth(request.nextUrl.pathname) && request.nextUrl.pathname !== '/') {
    return response;
  }

  const isSignedIn = await checkSignedIn();

  // NOTE: 要認証ページで認証済みでなければログインページへ
  if (needsAuth(request.nextUrl.pathname) && !isSignedIn) {
    return NextResponse.redirect(new URL('/sign_in', request.url));
  }
  // NOTE: TOPの向き先 認証済みの場合はTODO一覧、そうでなければログイン画面へ
  if (request.nextUrl.pathname === '/') {
    if (isSignedIn) {
      return NextResponse.redirect(new URL('/todos', request.url));
    }

    return NextResponse.redirect(new URL('/sign_in', request.url));
  }

  return response;
}

// NOTE: ビルドファイル, 画像最適化エンドポイント, ファビコン, 画像は対象外
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
