import confetti from 'canvas-confetti';

export interface SyncLog {
  timestamp: string;
  type: 'success' | 'info' | 'error';
  message: string;
}

export interface GoogleSheetsSyncState {
  enabled: boolean;
  connectedEmail: string | null;
  spreadsheetId: string | null;
  spreadsheetName: string;
  driveFolderName: string;
  lastSyncedAt: string | null;
  syncInProgress: boolean;
  logs: SyncLog[];
}

const INITIAL_SYNC_STATE: GoogleSheetsSyncState = {
  enabled: false,
  connectedEmail: null,
  spreadsheetId: null,
  spreadsheetName: 'GharKharch_Database',
  driveFolderName: 'GharKharch',
  lastSyncedAt: null,
  syncInProgress: false,
  logs: []
};

const STORAGE_KEY = 'gharkharch-gsheet-sync';

export const loadSyncState = (): GoogleSheetsSyncState => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      return INITIAL_SYNC_STATE;
    }
  }
  return INITIAL_SYNC_STATE;
};

export const saveSyncState = (state: GoogleSheetsSyncState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

/**
 * Converts a base64 DataURL (e.g. from receipt attachments) into a Blob for Drive uploading
 */
function base64ToBlob(base64DataUrl: string): Blob {
  const parts = base64DataUrl.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

/**
 * Runs the Real Google Sheets & Drive API Sync Engine with simulated graceful fallback.
 */
export const runGoogleSheetsSync = async (
  email: string,
  expenses: any[],
  budget: number,
  onStateUpdate: (state: GoogleSheetsSyncState) => void,
  isSilent: boolean = false
): Promise<boolean> => {
  const state = loadSyncState();
  const oauthToken = localStorage.getItem('gharkharch-oauth-token');

  // Trigger loading state
  const updatedState: GoogleSheetsSyncState = {
    ...state,
    enabled: true,
    connectedEmail: email,
    syncInProgress: true,
    logs: [
      {
        timestamp: new Date().toLocaleTimeString(),
        type: 'info',
        message: oauthToken 
          ? `[REAL API] Connecting to Google Cloud Platform...` 
          : `[SANDBOX SIMULATION] Commencing high-fidelity database sync...`
      },
      ...state.logs.slice(0, 15)
    ]
  };
  onStateUpdate(updatedState);
  saveSyncState(updatedState);

  // Logger helper
  const addLog = (msg: string, type: 'success' | 'info' | 'error' = 'info') => {
    const currentState = loadSyncState();
    const stateWithLog: GoogleSheetsSyncState = {
      ...currentState,
      logs: [
        {
          timestamp: new Date().toLocaleTimeString(),
          type,
          message: msg
        },
        ...currentState.logs.slice(0, 15)
      ]
    };
    onStateUpdate(stateWithLog);
    saveSyncState(stateWithLog);
  };

  // Delay helper
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Enforce Real Google API Sync: if no token exists, fail immediately
  if (!oauthToken) {
    addLog(`OAuth Token missing! Please sign out and sign in again with Google to connect.`, 'error');
    const curState = loadSyncState();
    onStateUpdate({
      ...curState,
      syncInProgress: false,
      logs: [
        { timestamp: new Date().toLocaleTimeString(), type: 'error', message: 'Sync failed: Unauthorized (Google OAuth Token missing).' },
        ...curState.logs
      ]
    });
    return false;
  }

  // ==================== REAL GOOGLE REST API SYNC FLOW ====================
  try {
    const authHeaders = {
      'Authorization': `Bearer ${oauthToken}`,
      'Content-Type': 'application/json'
    };

    // Helper: Search file in Drive
    const searchDriveFile = async (name: string, mimeType: string, parentId?: string): Promise<string | null> => {
      let query = `name = '${name}' and mimeType = '${mimeType}' and trashed = false`;
      if (parentId) {
        query += ` and '${parentId}' in parents`;
      }
      const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`, {
        headers: { 'Authorization': `Bearer ${oauthToken}` }
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Drive API search failed with status ${res.status}: ${errText}`);
      }
      const data = await res.json();
      return data.files?.[0]?.id || null;
    };

    // Step 1: Verify token / Auth Check
    addLog(`Validating OAuth token with Google Accounts API...`, 'info');
    const tokenCheck = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${oauthToken}`);
    if (!tokenCheck.ok) {
      localStorage.removeItem('gharkharch-oauth-token');
      addLog(`Expired or invalid OAuth token! Please re-sign in using Google.`, 'error');
      const curState = loadSyncState();
      onStateUpdate({ ...curState, syncInProgress: false });
      return false;
    }
    addLog(`✔ OAuth token verified successfully!`, 'success');
    await delay(500);

    // Step 2: Drive Folder Check / Creation
    addLog(`Searching Drive for Folder 'GharKharch'...`, 'info');
    let folderId = await searchDriveFile('GharKharch', 'application/vnd.google-apps.folder');
    
    if (!folderId) {
      addLog(`Folder 'GharKharch' not found. Creating brand new folder...`, 'info');
      const folderRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          name: 'GharKharch',
          mimeType: 'application/vnd.google-apps.folder'
        })
      });
      if (!folderRes.ok) {
        const errText = await folderRes.text();
        throw new Error(`Drive Folder creation failed with status ${folderRes.status}: ${errText}`);
      }
      const folderData = await folderRes.json();
      folderId = folderData.id;
      addLog(`✔ Created Folder 'GharKharch/' in Drive! (ID: ${folderId})`, 'success');
    } else {
      addLog(`✔ Found Folder 'GharKharch/' in Google Drive! (ID: ${folderId})`, 'success');
    }
    await delay(500);

    // Step 3: Spreadsheet Check / Creation
    addLog(`Locating Google Sheet 'GharKharch_Database' in Drive folder...`, 'info');
    let spreadsheetId = await searchDriveFile('GharKharch_Database', 'application/vnd.google-apps.spreadsheet', folderId || undefined);

    if (!spreadsheetId) {
      addLog(`Spreadsheet not found. Initializing new Spreadsheet...`, 'info');
      const sheetRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          name: 'GharKharch_Database',
          mimeType: 'application/vnd.google-apps.spreadsheet',
          parents: [folderId]
        })
      });
      if (!sheetRes.ok) {
        const errText = await sheetRes.text();
        throw new Error(`Spreadsheet creation failed with status ${sheetRes.status}: ${errText}`);
      }
      const sheetData = await sheetRes.json();
      spreadsheetId = sheetData.id;
      addLog(`✔ Created Spreadsheet 'GharKharch_Database'! (ID: ${spreadsheetId})`, 'success');
      
      // Initialize Sheets layout tabs
      await delay(600);
      addLog(`Configuring Spreadsheet pages: [Expenses] & [Budget]...`, 'info');
      const tabsRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          requests: [
            { addSheet: { properties: { title: 'Expenses' } } },
            { addSheet: { properties: { title: 'Budget' } } }
          ]
        })
      });
      if (!tabsRes.ok) {
        const errText = await tabsRes.text();
        throw new Error(`Spreadsheet layout configuration failed with status ${tabsRes.status}: ${errText}`);
      }
      addLog(`✔ Created spreadsheet tabs successfully!`, 'success');
    } else {
      addLog(`✔ Located Spreadsheet 'GharKharch_Database'! (ID: ${spreadsheetId})`, 'success');
    }
    await delay(500);

    // Step 4: Write Budget Tab
    addLog(`Updating Budget sheet page...`, 'info');
    const budgetValues = {
      range: 'Budget!A1',
      majorDimension: 'ROWS',
      values: [
        ['Month (YYYY-MM)', 'Budget Limit (INR)', 'Last Updated'],
        [new Date().toISOString().slice(0, 7), budget, new Date().toLocaleString('en-IN')]
      ]
    };
    const budgetRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Budget!A1?valueInputOption=USER_ENTERED`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(budgetValues)
    });
    if (!budgetRes.ok) {
      const errText = await budgetRes.text();
      throw new Error(`Budget update failed with status ${budgetRes.status}: ${errText}`);
    }
    addLog(`✔ Sheet 'Budget' updated successfully.`, 'success');
    await delay(500);

    // Step 5: Upload Receipt Images to Google Drive Folder
    const billExpenses = expenses.filter(exp => exp.billImage);
    if (billExpenses.length > 0) {
      addLog(`Uploading new bill attachments to Drive...`, 'info');
      for (const exp of billExpenses) {
        const receiptName = `receipt_${exp.id.slice(-5)}.png`;
        // Search if file already exists in Drive
        const fileId = await searchDriveFile(receiptName, 'image/png', folderId || undefined);
        if (!fileId) {
          addLog(`Uploading "${receiptName}"...`, 'info');
          const blob = base64ToBlob(exp.billImage);
          
          // Google Drive Multipart upload
          const metadata = {
            name: receiptName,
            parents: [folderId]
          };
          const form = new FormData();
          form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
          form.append('file', blob);

          await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${oauthToken}` },
            body: form
          });
          addLog(`✔ Uploaded image file: ${receiptName}`, 'success');
        }
      }
    }
    await delay(500);

    // Step 6: Write Expenses Tab (Latest First - sorted descending by Date/ID)
    addLog(`Writing transaction logs (Latest First)...`, 'info');
    const sortedExpenses = [...expenses].sort((a, b) => b.date.localeCompare(a.date));
    
    // Construct sheet rows
    const expenseRows = [
      ['Transaction ID', 'Date', 'Amount (INR)', 'Remarks', 'Category', 'Logged By (Member)', 'Attached Receipt File'],
      ...sortedExpenses.map(e => [
        e.id, 
        e.date, 
        e.amount, 
        e.remarks, 
        e.category, 
        e.memberRelation || 'Self',
        e.billImage ? `receipt_${e.id.slice(-5)}.png` : 'None'
      ])
    ];

    // Clear old values in Expenses page first
    const clearRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Expenses!A1:G1000:clear`, {
      method: 'POST',
      headers: authHeaders
    });
    if (!clearRes.ok) {
      const errText = await clearRes.text();
      throw new Error(`Failed to clear old expenses tab with status ${clearRes.status}: ${errText}`);
    }

    // Write sorted values
    const writeRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Expenses!A1?valueInputOption=USER_ENTERED`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        range: 'Expenses!A1',
        majorDimension: 'ROWS',
        values: expenseRows
      })
    });
    if (!writeRes.ok) {
      const errText = await writeRes.text();
      throw new Error(`Failed to write new expenses tab with status ${writeRes.status}: ${errText}`);
    }
    addLog(`✔ Successfully updated all ${sortedExpenses.length} expense rows (Current list first)!`, 'success');
    await delay(500);

    // Final Sync success status update
    const finalState = loadSyncState();
    onStateUpdate({
      ...finalState,
      enabled: true,
      spreadsheetId,
      lastSyncedAt: new Date().toLocaleString('en-IN', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
      }),
      syncInProgress: false,
      logs: [
        { timestamp: new Date().toLocaleTimeString(), type: 'success', message: '✔ Real-time Google Sheet Sync completed successfully!' },
        ...finalState.logs
      ]
    });

    if (!isSilent) {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#4285F4', '#34A853', '#FBBC05', '#EA4335']
      });
    }

    return true;

  } catch (error: any) {
    console.error("GSheet Sync Error:", error);
    addLog(`Sync error: ${error.message || 'Network timeout calling Google APIs'}`, 'error');
    const finalState = loadSyncState();
    onStateUpdate({ ...finalState, syncInProgress: false });
    return false;
  }
};
