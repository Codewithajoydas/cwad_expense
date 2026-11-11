import { View, Text } from "react-native";
import React, { PropsWithChildren } from "react";
import { SafeAreaView  } from "react-native-safe-area-context";
export default function SafeAreaViewComponent({ children }: PropsWithChildren) {
  return <SafeAreaView className="px-3">{children}</SafeAreaView>;
}
