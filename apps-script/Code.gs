/**
 * 早安圖集錦：GitHub Pages 的唯讀 JSONP 資料端點。
 * 將資料夾 ID 設為你自己的 Drive 資料夾 ID，再部署為網頁應用程式。
 */
const FOLDER_ID = '1xQUTmUYkkBAPtz58GFzbz0eE6qorRKUl';

function doGet(e) {
  const callback = String((e && e.parameter && e.parameter.callback) || '');
  if (!/^[A-Za-z_$][\w$]*$/.test(callback)) {
    return ContentService.createTextOutput('callback 必須是合法名稱')
      .setMimeType(ContentService.MimeType.TEXT);
  }
  try {
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const files = folder.getFiles();
    const result = [];
    while (files.hasNext()) {
      const file = files.next();
      if (!/^image\//.test(file.getMimeType())) continue;
      result.push({
        id: file.getId(),
        name: file.getName(),
        mimeType: file.getMimeType(),
        modifiedTime: file.getLastUpdated().toISOString(),
        thumbnailUrl: 'https://drive.google.com/thumbnail?id=' + encodeURIComponent(file.getId()) + '&sz=w1200',
        viewUrl: file.getUrl(),
        downloadUrl: 'https://drive.google.com/uc?export=download&id=' + encodeURIComponent(file.getId())
      });
    }
    result.sort((a, b) => b.modifiedTime.localeCompare(a.modifiedTime));
    const payload = JSON.stringify({ files: result, updatedAt: new Date().toISOString() })
      .replace(/</g, '\\u003c');
    return ContentService.createTextOutput(callback + '(' + payload + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } catch (err) {
    const payload = JSON.stringify({ error: String(err && err.message || err) }).replace(/</g, '\\u003c');
    return ContentService.createTextOutput(callback + '(' + payload + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}
