import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import os from 'os';
import { promises, existsSync, mkdirSync } from 'fs';
import textToSpeech from '@google-cloud/text-to-speech';
import {google} from '@google-cloud/text-to-speech/build/protos/protos';
import ISynthesizeSpeechRequest = google.cloud.texttospeech.v1.ISynthesizeSpeechRequest;
const client = new textToSpeech.TextToSpeechClient();

// needed in case process is undefined under Linux
const platform = process.platform || os.platform();

let mainWindow: BrowserWindow | undefined;

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, 'icons/icon.png'), // tray icon
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
    },
  });

  mainWindow.loadURL(process.env.APP_URL);

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools();
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow?.webContents.closeDevTools();
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = undefined;
  });
}

app.whenReady().then(() => {
  ipcMain.handle('greeting', () => 'Hello World');
  ipcMain.handle('convert', (event, data) => convert(data))
  createWindow()
});

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === undefined) {
    createWindow();
  }
});

async function convert(data: {
  text: string,
  filename: string,
  voice: {
    languageCode: string,
    name: string,
    ssmlGender: string
  }
}) {
  const request = {
    input: { text: data.text },
    // Select the language and SSML voice gender (optional)
    voice: data.voice,
    // select the type of audio encoding
    audioConfig: { audioEncoding: 'MP3' },
  } as ISynthesizeSpeechRequest;

  console.log(path.dirname('mp3'))
  const f = app.getPath('home')+path.sep+'google-mp3'+path.sep+data.filename+'_'+Date.now()+'.mp3'
  // Performs the text-to-speech request
  const [response] = await client.synthesizeSpeech(request);
  if(!existsSync(app.getPath('home')+path.sep+'google-mp3')) {
    mkdirSync(app.getPath('home')+path.sep+'google-mp3')
  }
  await promises.writeFile(f, response.audioContent, 'binary');
  return new Promise((resolve) => {
    resolve({
      filename: f,
      path: app.getPath('home')
    });
  });
}
