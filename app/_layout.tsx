import { withLayoutContext } from "expo-router";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { PaperProvider, MD3DarkTheme, MD3LightTheme } from "react-native-paper";
import { Appearance } from "react-native";
import React, {
  createContext,
  useEffect,
  useState,
  useContext,
  ReactNode,
} from "react";
import { setupDatabase } from "../lib/db";
import { Ionicons } from "@expo/vector-icons";
import DisplayMessage from "@/components/displayMessage";
import { StatusBar } from "expo-status-bar";

// Create a custom drawer navigator
const { Navigator } = createDrawerNavigator();
// Override the default drawer with our custom one
const DrawerNavigator = withLayoutContext(Navigator);

// Theme context and provider (move to own file?)
const ThemeContext = createContext<
  { darkMode: boolean; toggleTheme: () => void } | undefined
>(undefined);
export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within a ThemeProvider");
  }
  return context;
};

const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(
    Appearance.getColorScheme() === "dark"
  );
  const toggleTheme = () => setDarkMode((prev) => !prev);
  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Message context and provider (move to own file?)
interface MessageContextType {
  message: string;
  messageType: "error" | "success";
  triggerMessage: (msg: string, type: "error" | "success") => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessage must be used within a MessageProvider");
  }
  return context;
};

interface MessageProviderProps {
  children: ReactNode;
}

const MessageProvider = ({ children }: MessageProviderProps) => {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">(
    "success"
  );

  const triggerMessage = (msg: string, type: "error" | "success") => {
    setMessage(msg);
    setMessageType(type);
    // Clear the message after 2 seconds
    setTimeout(() => {
      setMessage("");
    }, 2000);
  };

  return (
    <MessageContext.Provider value={{ message, messageType, triggerMessage }}>
      {children}
    </MessageContext.Provider>
  );
};

export default function LayoutWrapper() {
  useEffect(() => {
    setupDatabase();
  }, []);

  return (
    <ThemeProvider>
      <MessageProvider>
        <RootLayout />
      </MessageProvider>
    </ThemeProvider>
  );
}

// Root layout with drawer navigator
function RootLayout() {
  const { darkMode } = useAppTheme();
  const theme = darkMode ? MD3DarkTheme : MD3LightTheme;
  const { message, messageType } = useMessage();

  return (
    <PaperProvider theme={theme}>
      <StatusBar style={darkMode ? "light" : "dark"} />
      <DisplayMessage messageText={message} messageType={messageType} />
      <DrawerNavigator
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.onBackground,
          drawerStyle: {
            backgroundColor: theme.colors.background,
          },
          drawerActiveTintColor: theme.colors.primary,
          drawerInactiveTintColor: theme.colors.onBackground,
        }}
      >
        {/* Define which routes should appear in the drawer */}
        <DrawerNavigator.Screen
          name="index"
          options={{
            title: "Home",
            drawerIcon: ({ color, size }: { color: string; size: number }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <DrawerNavigator.Screen
          name="books/add"
          options={{
            title: "Add Book",
            drawerIcon: ({ color, size }: { color: string; size: number }) => (
              <Ionicons name="add-circle" size={size} color={color} />
            ),
          }}
        />
        <DrawerNavigator.Screen
          name="books/index"
          options={{
            title: "Books",
            drawerIcon: ({ color, size }: { color: string; size: number }) => (
              <Ionicons name="book" size={size} color={color} />
            ),
          }}
        />
        <DrawerNavigator.Screen
          name="authors/index"
          options={{
            title: "Authors",
            drawerIcon: ({ color, size }: { color: string; size: number }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
        <DrawerNavigator.Screen
          name="genres/index"
          options={{
            title: "Genres",
            drawerIcon: ({ color, size }: { color: string; size: number }) => (
              <Ionicons name="list" size={size} color={color} />
            ),
          }}
        />
        <DrawerNavigator.Screen
          name="settings"
          options={{
            title: "Settings",
            drawerIcon: ({ color, size }: { color: string; size: number }) => (
              <Ionicons name="settings" size={size} color={color} />
            ),
          }}
        />

        {/* Hacky solution to hide ones we don't want to see in drawer */}
        <DrawerNavigator.Screen
          name="books/[id]"
          options={{
            drawerItemStyle: { height: 0 },
            headerShown: true,
            title: "Book Details",
          }}
        />
        <DrawerNavigator.Screen
          name="books/edit/[id]"
          options={{
            drawerItemStyle: { height: 0 },
            headerShown: true,
            title: "Edit Book",
          }}
        />
        <DrawerNavigator.Screen
          name="books/delete/[id]"
          options={{
            drawerItemStyle: { height: 0 },
            headerShown: true,
            title: "Delete Book",
          }}
        />
        <DrawerNavigator.Screen
          name="books/rate/[id]"
          options={{
            drawerItemStyle: { height: 0 },
            headerShown: true,
            title: "Rate Book",
          }}
        />
        <DrawerNavigator.Screen
          name="genres/[id]"
          options={{
            drawerItemStyle: { height: 0 },
            headerShown: true,
            title: "Genre Details",
          }}
        />
        <DrawerNavigator.Screen
          name="genres/edit/[id]"
          options={{
            drawerItemStyle: { height: 0 },
            headerShown: true,
            title: "Edit Genre",
          }}
        />
        <DrawerNavigator.Screen
          name="genres/delete/[id]"
          options={{
            drawerItemStyle: { height: 0 },
            headerShown: true,
            title: "Delete Genre",
          }}
        />
        <DrawerNavigator.Screen
          name="authors/[id]"
          options={{
            drawerItemStyle: { height: 0 },
            headerShown: true,
            title: "Author Details",
          }}
        />
        <DrawerNavigator.Screen
          name="authors/edit/[id]"
          options={{
            drawerItemStyle: { height: 0 },
            headerShown: true,
            title: "Edit Author",
          }}
        />
        <DrawerNavigator.Screen
          name="authors/delete/[id]"
          options={{
            drawerItemStyle: { height: 0 },
            headerShown: true,
            title: "Delet Author",
          }}
        />
      </DrawerNavigator>
    </PaperProvider>
  );
}
