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
          background-color: #F8F5F2;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
          color: #1F2937;
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
          background-color: #F8F5F2;
          padding-top: 40px;
          padding-bottom: 40px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #FFFFFF;
          border: 1px solid #E8E5E0;
          border-radius: 4px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(31, 41, 55, 0.02);
        }
        .header {
          padding: 32px 40px;
          background-color: #FFFFFF;
          border-bottom: 1px solid #F8F5F2;
          text-align: center;
        }
        .logo-box {
          display: inline-block;
          width: 44px;
          height: 44px;
          line-height: 44px;
          background-color: #1F2937;
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
          color: #1F2937;
          margin-top: 12px;
          letter-spacing: 0.05em;
        }
        .body-content {
          padding: 40px 40px;
          background-color: #FFFFFF;
        }
        .footer {
          padding: 32px 40px;
          background-color: #F8F5F2;
          border-top: 1px solid #E8E5E0;
          text-align: center;
          font-size: 12px;
          color: #6B7280;
          line-height: 1.6;
        }
        h1, h2, h3 {
          font-family: Georgia, serif;
          color: #1F2937;
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
          color: #1F2937;
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
          background-color: #1F2937;
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
          background-color: #374151;
        }
        .bullet-list {
          margin: 0 0 24px 0;
          padding-left: 20px;
        }
        .bullet-item {
          font-size: 14px;
          line-height: 1.6;
          color: #4B5563;
          margin-bottom: 8px;
        }
        .highlight-box {
          background-color: #F8F5F2;
          border: 1px solid #E8E5E0;
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
          color: #6B7280;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .highlight-value {
          font-size: 16px;
          font-weight: 600;
          color: #1F2937;
        }
        .divider {
          height: 1px;
          background-color: #E8E5E0;
          margin: 24px 0;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <div class="logo-box">P</div>
            <div class="brand-name">PsySphere</div>
          </div>
          <div class="body-content">
            ${contentHtml}
          </div>
          <div class="footer">
            <p style="margin-bottom: 8px; font-size: 12px; color: #6B7280;">© 2026 PsySphere Technologies. All rights reserved.</p>
            <p style="margin: 0; font-size: 11px; color: #9CA3AF;">This is an administrative email regarding your academic enrollment. You cannot unsubscribe from system notifications.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
