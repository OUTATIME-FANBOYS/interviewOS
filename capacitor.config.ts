import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.tanmay.interviewos",
  appName: "InterviewOS",
  webDir: "out",
  server: {
    url: "http://localhost:3000",
    cleartext: true,
  },
  plugins: {
    CapacitorSQLite: {
      iosDatabaseLocation: "Library/Database",
      iosIsEncryption: false,
      iosKeychainPrefix: "interview-os",
      androidIsEncryption: false,
      androidDatabaseLocation: "default",
    },
    Keyboard: {
      resize: "body",
      resizeOnFullScreen: true,
    },
    StatusBar: {
      style: "dark",
    },
  },
};

export default config;
