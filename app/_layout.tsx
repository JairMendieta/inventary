import { Stack } from "expo-router";
import { initDB } from "../database/db";

// Initialize the database once at app startup before any hooks run
initDB();

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
