/**
 * TUWAIQ INIT — receives one assessment submission and appends it to the spreadsheet.
 * Deploy as a Web App (Execute as: Me · Who has access: Anyone).
 *
 * Tabs:
 *   "Responses v2" — current assessment (created automatically with its header row).
 *   "Responses"    — the first version's rows. This script never reads, writes or clears it.
 *
 * Rows are written by header name, so reordering columns or adding your own columns in the
 * sheet is safe. Headers are only ever added: a missing expected header is appended at the end
 * of row 1, and existing headers, columns and response rows are never cleared, moved or removed.
 * (Columns from the previous question set stay in place and are simply left blank for new rows.)
 */

const SHEET_NAME = "Responses v2";
/** Returned by doGet, so you can open the Web App URL and see which code is live. */
const SCRIPT_VERSION = "v3-final-18q";

const list_ = (v) => (Array.isArray(v) ? v.join(", ") : v || "");
const text_ = (v) => (typeof v === "string" ? v : "");
const date_ = (v) => (v ? new Date(v) : new Date());

// [header, value from the submitted JSON] — one entry per column, in order.
const COLUMNS = [
  ["Full Name", (d) => text_(d.fullName)],
  ["Major", (d) => text_(d.major)],
  ["Academic Year", (d) => text_(d.academicYear)],
  ["Submitted At", (d) => date_(d.submittedAt)],

  ["Programming Experience", (d) => text_(d.programmingExperience)],
  ["Build Ability", (d) => text_(d.buildAbility)],
  ["Git/GitHub Usage", (d) => text_(d.gitGithubUsage)],
  ["AI Usage", (d) => text_(d.aiUsage)],
  ["Teamwork Experience", (d) => text_(d.teamworkExperience)],
  ["Technologies Used", (d) => list_(d.technologiesUsed)],

  ["Interests", (d) => list_(d.interests)],
  ["Preferred Activities", (d) => list_(d.preferredActivities)],
  ["Learning Preference", (d) => text_(d.learningPreference)],
  ["Learning Preference Details", (d) => text_(d.learningPreferenceDetails)],

  ["Track Avoidances", (d) => list_(d.trackAvoidances)],
  ["Helping Preference", (d) => text_(d.helpingPreference)],
  ["Preferred Team Role", (d) => text_(d.preferredTeamRole)],

  ["Preferred Times", (d) => list_(d.preferredTimes)],
  ["Activity Format", (d) => text_(d.activityFormat)],
  ["Potential Blocker", (d) => text_(d.potentialBlocker)],

  ["Success Definition", (d) => text_(d.successDefinition)],
  ["Favorite Color", (d) => (d.favoriteColor && d.favoriteColor.name) || ""],
  ["Favorite Color Hex", (d) => (d.favoriteColor && d.favoriteColor.hex) || ""],
  ["Leadership Note", (d) => text_(d.leadershipNote)],
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
 * Run from the Apps Script editor to create "Responses v2" (or bring its headers up to date).
 * Safe to run any time: it never deletes, clears or moves a response row.
 */
function setupSheet() {
  const headers = ensureHeaders_(getSheet_(SHEET_NAME), COLUMNS);
  Logger.log('"%s" ready with %s columns: %s', SHEET_NAME, headers.length, headers.join(" | "));
}

function doGet() {
  return json_({ ok: true, service: "tuwaiq-init", version: SCRIPT_VERSION, sheet: SHEET_NAME });
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
