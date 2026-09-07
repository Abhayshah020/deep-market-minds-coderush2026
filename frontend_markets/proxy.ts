import {
    NextRequest,
    NextResponse,
} from "next/server";

export function proxy(
    request: NextRequest,
) {
    const { pathname } = request.nextUrl;

    /*
     * Public routes
     */
    if (
        pathname === "/" ||
        pathname === "/auth" ||
        pathname.startsWith("/auth/")
    ) {
        return NextResponse.next();
    }

    /*
     * Public Next.js internal files
     */
    if (
        pathname.startsWith("/_next/") ||
        pathname === "/favicon.ico" ||
        pathname === "/robots.txt" ||
        pathname === "/sitemap.xml"
    ) {
        return NextResponse.next();
    }

    /*
     * Public static files
     *
     * Images, fonts, CSS, JS, SVG, etc.
     */
    const publicFileExtensions =
        /\.(?:jpg|jpeg|png|gif|webp|avif|svg|ico|bmp|tiff|woff|woff2|ttf|otf|css|js|map|txt|xml)$/i;

    if (publicFileExtensions.test(pathname)) {
        return NextResponse.next();
    }

    /*
     * Authentication
     *
     * IMPORTANT:
     * sessionStorage is browser-only and cannot be
     * accessed from Next.js proxy/server code.
     *
     * Therefore the JWT must eventually be stored
     * in a cookie if proxy-level authentication is required.
     */

    const token =
        request.cookies.get(
            "auth_token",
        )?.value;

    if (!token) {
        const loginUrl =
            request.nextUrl.clone();

        loginUrl.pathname = "/auth";

        loginUrl.searchParams.set(
            "redirect",
            pathname,
        );

        return NextResponse.redirect(
            loginUrl,
        );
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Run proxy on application routes,
         * excluding common static/internal paths.
         */
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};