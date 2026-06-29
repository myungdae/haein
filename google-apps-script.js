/**
 * 강해인 怡娜 웹사이트 - Google Apps Script
 * 
 * ▶ 설치 방법:
 * 1. Google Sheets 새 스프레드시트 열기
 *    → 시트 이름을 "문의접수"로 변경
 *    → 두 번째 시트 추가 후 "수강신청"으로 이름 변경
 *
 * 2. 확장 프로그램 → Apps Script 클릭
 *
 * 3. 이 파일의 내용을 전체 복사 → Apps Script 편집기에 붙여넣기
 *
 * 4. 상단 저장(💾) 클릭
 *
 * 5. 배포 → 새 배포 → 유형: 웹 앱
 *    - 설명: v1
 *    - 다음 사용자로 실행: 나(내 계정)
 *    - 액세스 권한: 모든 사용자(익명 포함)
 *    → 배포 클릭 → 액세스 승인
 *
 * 6. 웹 앱 URL 복사 → main.js 의 SCRIPT_URL 에 붙여넣기
 */

// =============================================
// 스프레드시트 설정
// =============================================
const SHEET_CONTACT = '문의접수';   // 공연문의 시트 이름
const SHEET_APPLY   = '수강신청';   // 시낭송교실 수강신청 시트 이름

// =============================================
// POST 요청 처리 (폼 데이터 수신)
// =============================================
function doPost(e) {
  try {
    const ss     = SpreadsheetApp.getActiveSpreadsheet();
    const params = JSON.parse(e.postData.contents);
    const type   = params.formType || 'contact';

    if (type === 'apply') {
      saveApply(ss, params);
    } else {
      saveContact(ss, params);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// =============================================
// 공연문의 저장
// =============================================
function saveContact(ss, p) {
  let sheet = ss.getSheetByName(SHEET_CONTACT);

  // 시트가 없으면 생성 + 헤더
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_CONTACT);
    sheet.appendRow(['접수일시', '이름', '연락처', '이메일', '문의유형', '소속', '문의내용']);
    sheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#7B1A2E').setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 160);
    sheet.setColumnWidth(7, 300);
  }

  const now = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');
  sheet.appendRow([
    now,
    p.name    || '',
    p.tel     || '',
    p.email   || '',
    p.type    || '',
    p.org     || '',
    p.message || ''
  ]);

  // 새 행 교대 색상
  const lastRow = sheet.getLastRow();
  if (lastRow % 2 === 0) {
    sheet.getRange(lastRow, 1, 1, 7).setBackground('#FFF0F3');
  }
}

// =============================================
// 수강신청 저장
// =============================================
function saveApply(ss, p) {
  let sheet = ss.getSheetByName(SHEET_APPLY);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_APPLY);
    sheet.appendRow(['접수일시', '이름', '연락처', '이메일', '수강과정', '문의내용']);
    sheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#7B1A2E').setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 160);
    sheet.setColumnWidth(6, 300);
  }

  const now = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');
  sheet.appendRow([
    now,
    p.name    || '',
    p.tel     || '',
    p.email   || '',
    p.course  || '',
    p.message || ''
  ]);

  const lastRow = sheet.getLastRow();
  if (lastRow % 2 === 0) {
    sheet.getRange(lastRow, 1, 1, 6).setBackground('#FFF0F3');
  }
}

// =============================================
// GET 요청 - 동작 확인용
// =============================================
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: '강해인 怡娜 폼 수신 서버 정상 동작 중' }))
    .setMimeType(ContentService.MimeType.JSON);
}
