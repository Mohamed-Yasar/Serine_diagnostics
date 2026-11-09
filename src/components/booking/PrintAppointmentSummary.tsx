export interface PrintAppointmentSummaryData {
  confirmationNumber?: string;
  testName: string;
  turnaroundTime?: string;
  locationName: string;
  address: string;
  city: string;
  state: string;
  zip?: string;
  phone?: string;
  selectedDate: string;
  selectedTime: string;
  patientName: string;
  fastingRequired?: boolean;
}

function escapeHtml(value: string = ''): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(dateValue: string): string {
  const match = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return dateValue;
  }

  const [, year, month, day] = match;
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  );

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function printAppointmentSummary(
  data: PrintAppointmentSummaryData
): void {
  const popup = window.open(
    '',
    '_blank',
    'width=900,height=900'
  );

  if (!popup) {
    window.alert(
      'Please allow pop-ups for this site to print the appointment summary.'
    );
    return;
  }

  const confirmation = escapeHtml(
    data.confirmationNumber || 'Pending'
  );
  const patientName = escapeHtml(data.patientName);
  const testName = escapeHtml(data.testName);
  const turnaround = escapeHtml(
    data.turnaroundTime || ''
  );
  const locationName = escapeHtml(data.locationName);
  const address = escapeHtml(data.address);
  const cityStateZip = escapeHtml(
    `${data.city}, ${data.state}${
      data.zip ? ` ${data.zip}` : ''
    }`
  );
  const phone = escapeHtml(data.phone || '');
  const date = escapeHtml(
    formatDate(data.selectedDate)
  );
  const time = escapeHtml(data.selectedTime);

  popup.document.open();

  popup.document.write(`<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />
  <title>Serine Diagnostics - Appointment Summary</title>

  <style>
    @page {
      size: Letter;
      margin: 0.55in;
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #103d4a;
      font-family:
        Arial,
        Helvetica,
        sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      min-height: 100vh;
    }

    .page {
      width: 100%;
      max-width: 720px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #168d90;
    }

    .brand {
      font-size: 22px;
      line-height: 1;
      font-weight: 800;
      letter-spacing: 4px;
      color: #103d4a;
    }

    .brand-sub {
      margin-top: 5px;
      color: #168d90;
      font-size: 9px;
      line-height: 1;
      font-weight: 700;
      letter-spacing: 3px;
    }

    .header-right {
      text-align: right;
      color: #607b83;
      font-size: 10px;
      line-height: 1.5;
    }

    .title {
      margin: 24px 0 5px;
      color: #103d4a;
      font-size: 25px;
      line-height: 1.2;
      font-weight: 800;
    }

    .subtitle {
      margin: 0 0 18px;
      color: #607b83;
      font-size: 11px;
      line-height: 1.5;
    }

    .confirmation {
      margin-bottom: 12px;
      padding: 13px 15px;
      border: 1px solid #cfe4e6;
      border-radius: 9px;
      background: #f5fbfb;
    }

    .label {
      color: #718e96;
      font-size: 9px;
      line-height: 1.2;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .confirmation-id {
      margin-top: 5px;
      color: #103d4a;
      font-family:
        ui-monospace,
        SFMono-Regular,
        Menlo,
        Consolas,
        monospace;
      font-size: 17px;
      line-height: 1.2;
      font-weight: 800;
      letter-spacing: 1px;
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .card {
      padding: 14px;
      border: 1px solid #dce8ea;
      border-radius: 9px;
      background: #ffffff;
    }

    .value {
      margin-top: 5px;
      color: #103d4a;
      font-size: 13px;
      line-height: 1.4;
      font-weight: 700;
    }

    .muted {
      margin-top: 4px;
      color: #607b83;
      font-size: 10px;
      line-height: 1.5;
    }

    .appointment {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin: 12px 0;
      padding: 15px;
      border-radius: 9px;
      background: #103d4a;
      color: #ffffff;
    }

    .appointment .label {
      color: #b9d9dc;
    }

    .appointment .value {
      color: #ffffff;
      font-size: 14px;
    }

    .fasting {
      margin-top: 12px;
      padding: 11px 13px;
      border: 1px solid #ead7ac;
      border-radius: 8px;
      background: #fff9ed;
      color: #7c5a20;
      font-size: 10px;
      line-height: 1.5;
    }

    .footer {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      margin-top: 20px;
      padding-top: 12px;
      border-top: 1px solid #dce8ea;
      color: #718e96;
      font-size: 9px;
      line-height: 1.5;
    }

    .footer-right {
      text-align: right;
    }

    @media screen {
      body {
        padding: 30px;
        background: #eef5f6;
      }

      .page {
        padding: 34px;
        background: #ffffff;
        box-shadow:
          0 10px 35px rgba(16, 61, 74, 0.12);
      }
    }

    @media print {
      body {
        background: #ffffff;
      }

      .page {
        max-width: none;
      }
    }
  </style>
</head>

<body>
  <main class="page">
    <header class="header">
      <div>
        <div class="brand">SERINE</div>
        <div class="brand-sub">DIAGNOSTICS</div>
      </div>

      <div class="header-right">
        Clinical Laboratory &amp; Diagnostic Testing<br />
        Chicago, Illinois
        ${
          phone
            ? `<br />Patient Service Center: ${phone}`
            : ''
        }
      </div>
    </header>

    <h1 class="title">Appointment Summary</h1>

    <p class="subtitle">
      Please keep this confirmation for your visit.
    </p>

    <section class="confirmation">
      <div class="label">
        Confirmation Reference
      </div>

      <div class="confirmation-id">
        ${confirmation}
      </div>
    </section>

    <section class="grid">
      <div class="card">
        <div class="label">Patient</div>
        <div class="value">${patientName}</div>
      </div>

      <div class="card">
        <div class="label">Test / Service</div>
        <div class="value">${testName}</div>
        ${
          turnaround
            ? `<div class="muted">${turnaround}</div>`
            : ''
        }
      </div>
    </section>

    <section class="appointment">
      <div>
        <div class="label">Appointment Date</div>
        <div class="value">${date}</div>
      </div>

      <div>
        <div class="label">Appointment Time</div>
        <div class="value">${time}</div>
      </div>
    </section>

    <section class="card">
      <div class="label">
        Patient Service Center
      </div>

      <div class="value">
        ${locationName}
      </div>

      <div class="muted">
        ${address}<br />
        ${cityStateZip}
        ${phone ? `<br />Phone: ${phone}` : ''}
      </div>
    </section>

    ${
      data.fastingRequired
        ? `
      <section class="fasting">
        <strong>Fasting Reminder:</strong>
        Please do not eat or drink anything other than
        plain water for 10 to 12 hours prior to your
        blood draw. Continue drinking water to stay
        hydrated.
      </section>
    `
        : ''
    }

    <footer class="footer">
      <div>
        Serine Diagnostics<br />
        Clinical Laboratory &amp; Diagnostic Testing
      </div>

      <div class="footer-right">
        Please arrive for your scheduled appointment.<br />
        Keep your confirmation reference available.
      </div>
    </footer>
  </main>

  <script>
    window.addEventListener('load', function () {
      window.focus();
      window.print();
    });
  </script>
</body>
</html>`);

  popup.document.close();
}
