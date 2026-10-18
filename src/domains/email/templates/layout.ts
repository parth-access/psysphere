export function renderBaseEmailLayout(title: string, contentHtml: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          width: 100% !important;
          background-color: #FAF6EF;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
          color: #1C2541;
        }
        table {
          border-collapse: collapse;
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
        }
        img {
          border: 0;
          height: auto;
          line-height: 100%;
          outline: none;
          text-decoration: none;
        }
        .wrapper {
          width: 100%;
          table-layout: fixed;
          background-color: #FAF6EF;
          padding-top: 40px;
          padding-bottom: 40px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #FFFFFF;
          border: 1px solid #E7E1D6;
          border-radius: 4px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(31, 41, 55, 0.02);
        }
        .header {
          padding: 32px 40px;
          background-color: #FFFFFF;
          border-bottom: 1px solid #FAF6EF;
          text-align: center;
        }
        .logo-box {
          display: inline-block;
          width: 44px;
          height: 44px;
          line-height: 44px;
          background-color: #1C2541;
          color: #FFFFFF;
          font-family: Georgia, serif;
          font-style: italic;
          font-size: 24px;
          font-weight: bold;
          text-align: center;
          border-radius: 2px;
        }
        .brand-name {
          font-family: Georgia, serif;
          font-size: 18px;
          font-weight: bold;
          color: #1C2541;
          margin-top: 12px;
          letter-spacing: 0.05em;
        }
        .body-content {
          padding: 40px 40px;
          background-color: #FFFFFF;
        }
        .footer {
          padding: 32px 40px;
          background-color: #FAF6EF;
          border-top: 1px solid #E7E1D6;
          text-align: center;
          font-size: 12px;
          color: #5B6478;
          line-height: 1.6;
        }
        .automated-notice {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #E7E1D6;
          font-size: 13px;
          color: #5B6478;
        }
        .automated-notice a {
          color: #1C2541;
          font-weight: 600;
          text-decoration: underline;
        }
        h1, h2, h3 {
          font-family: Georgia, serif;
          color: #1C2541;
          margin-top: 0;
          font-weight: bold;
        }
        h1 {
          font-size: 24px;
          line-height: 1.3;
          margin-bottom: 16px;
        }
        p {
          font-size: 15px;
          line-height: 1.6;
          color: #1C2541;
          margin-top: 0;
          margin-bottom: 20px;
        }
        .btn-container {
          margin-top: 32px;
          margin-bottom: 32px;
          text-align: center;
        }
        .btn {
          display: inline-block;
          background-color: #1C2541;
          color: #FFFFFF !important;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          padding: 12px 28px;
          border-radius: 2px;
          letter-spacing: 0.02em;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          transition: background-color 0.2s ease;
        }
        .btn:hover {
          background-color: #2E3A5F;
        }
        .bullet-list {
          margin: 0 0 24px 0;
          padding-left: 20px;
        }
        .bullet-item {
          font-size: 14px;
          line-height: 1.6;
          color: #5B6478;
          margin-bottom: 8px;
        }
        .highlight-box {
          background-color: #FAF6EF;
          border: 1px solid #E7E1D6;
          padding: 24px;
          border-radius: 2px;
          margin-bottom: 24px;
        }
        .highlight-item {
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 12px;
        }
        .highlight-item:last-child {
          margin-bottom: 0;
        }
        .highlight-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #5B6478;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .highlight-value {
          font-size: 16px;
          font-weight: 600;
          color: #1C2541;
        }
        .divider {
          height: 1px;
          background-color: #E7E1D6;
          margin: 24px 0;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <div class="logo-box">S</div>
            <div class="brand-name">Saarthi Classes</div>
          </div>
          <div class="body-content">
            ${contentHtml}
          </div>
          <div class="footer">
            <div class="automated-notice">
              <p style="margin-bottom: 8px;">This is an automated email from Saarthi Classes. This inbox is not monitored for replies.</p>
              <p style="margin: 0;">Need help or have a question? Please use our <a href="https://classes.saarthilife.com/contact">Contact Form</a>.</p>
            </div>
            <div class="divider"></div>
            <p style="margin-bottom: 8px; font-size: 12px; color: #5B6478;">© 2026 Saarthi Classes. All rights reserved.</p>
            <p style="margin: 0; font-size: 11px; color: #9CA3AF;">This is an administrative email regarding your academic enrollment. You cannot unsubscribe from system notifications.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
