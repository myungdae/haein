import { jsxRenderer } from 'hono/jsx-renderer';

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html lang="ko">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <title>강해인 시낭송교실</title>
        <meta
          name="description"
          content="강해인과 함께하는 시낭송교실. 문학의 집 서울에서 진행되는 정규 클래스 안내와 수강 신청."
        />
        <meta name="theme-color" content="#6B2737" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="시낭송교실" />
        <meta property="og:title" content="강해인 시낭송교실" />
        <meta property="og:description" content="문학의 집 서울에서 진행되는 강해인 시낭송 정규 클래스" />
        <meta property="og:type" content="website" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link rel="stylesheet" href="/static/style.css" />
      </head>
      <body>
        {children}
        <script src="/static/app.js" defer></script>
      </body>
    </html>
  );
});
