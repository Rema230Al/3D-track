/**
 * 3D Printing Track — receives one assessment submission and appends it to the spreadsheet.
 * Deploy as a Web App (Execute as: Me · Who has access: Anyone).
 *
 * This script belongs to the 3D Printing Track's OWN Google Sheet. Do not paste it into the
 * Programming Track (TUWAIQ INIT) sheet: bound scripts write to the sheet they live in.
 *
 * Tab: "Responses" (created automatically with its header row).
 *
 * Rows are written by header name, so reordering columns or adding your own columns in the
 * sheet is safe. Headers are only ever added: a missing expected header is appended at the end
 * of row 1, and existing headers, columns and response rows are never cleared, moved or removed.
 * (When the questions change, old columns stay in place and are simply left blank for new rows.)
 */

const SHEET_NAME = "Responses";
/** Returned by doGet, so you can open the Web App URL and see which code is live. */
const SCRIPT_VERSION = "3dp-v1-16q";

const list_ = (v) => (Array.isArray(v) ? v.join(", ") : v || "");
const text_ = (v) => (typeof v === "string" ? v : "");
const date_ = (v) => (v ? new Date(v) : new Date());

// [header, value from the submitted JSON] — one entry per column, in order.
const COLUMNS = [
  ["Full Name", (d) => text_(d.fullName)],
  ["Major", (d) => text_(d.major)],
  ["Academic Year", (d) => text_(d.academicYear)],
  ["Submitted At", (d) => date_(d.submittedAt)],

  // Level from questions 1–3 (01 = 1 … 04 = 4). Never shown to the member.
  ["Level Score", (d) => (typeof d.levelScore === "number" ? d.levelScore : "")],
  ["Level", (d) => text_(d.level)],

  ["3D Printing Experience", (d) => text_(d.printingExperience)],
  ["Project Ability", (d) => text_(d.projectAbility)],
  ["Teamwork Experience", (d) => text_(d.teamworkExperience)],

  ["Design Tools", (d) => list_(d.designTools)],
  ["Preferred Activities", (d) => list_(d.preferredActivities)],
  ["Explore Preference", (d) => text_(d.explorePreference)],

  ["Track Avoidances", (d) => list_(d.trackAvoidances)],
  ["Helping Preference", (d) => text_(d.helpingPreference)],
  ["Project Type", (d) => text_(d.projectType)],

  ["Preferred Times", (d) => list_(d.preferredTimes)],
  ["Activity Format", (d) => text_(d.activityFormat)],
  ["Potential Blocker", (d) => text_(d.potentialBlocker)],
  ["Discord & Notion Joined", (d) => text_(d.communityJoined)],

  ["Success Definition", (d) => text_(d.successDefinition)],
  ["Favorite Color", (d) => (d.favoriteColor && d.favoriteColor.name) || ""],
  ["Favorite Color Hex", (d) => (d.favoriteColor && d.favoriteColor.hex) || ""],
  ["Note", (d) => text_(d.leadershipNote)],
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse(e.postData.contents);
    appendByHeader_(getSheet_(SHEET_NAME), COLUMNS, data);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Run from the Apps Script editor to create "Responses" (or bring its headers up to date).
 * Safe to run any time: it never deletes, clears or moves a response row.
 */
function setupSheet() {
  const headers = ensureHeaders_(getSheet_(SHEET_NAME), COLUMNS);
  Logger.log('"%s" ready with %s columns: %s', SHEET_NAME, headers.length, headers.join(" | "));
}

function doGet() {
  return json_({ ok: true, service: "tuwaiq-3d-track", version: SCRIPT_VERSION, sheet: SHEET_NAME });
}

function getSheet_(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

/**
 * Makes sure row 1 holds every expected header and returns the header row.
 * Additive only: existing headers stay exactly where they are, and any missing
 * expected header is appended after the last used column. Nothing is ever cleared.
 */
function ensureHeaders_(sheet, columns) {
  const lastCol = sheet.getLastColumn();
  const headers = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0].map((h) => String(h).trim()) : [];
  columns.forEach(([header]) => {
    if (headers.indexOf(header) === -1) {
      headers.push(header);
      sheet.getRange(1, headers.length).setValue(header).setFontWeight("bold");
    }
  });
  if (sheet.getFrozenRows() === 0) sheet.setFrozenRows(1);
  return headers;
}

/** Appends one row, placing each value under its header. Never touches existing rows. */
function appendByHeader_(sheet, columns, data) {
  const headers = ensureHeaders_(sheet, columns);
  const row = headers.map(() => "");
  columns.forEach(([header, value]) => {
    row[headers.indexOf(header)] = value(data);
  });
  sheet.appendRow(row);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
