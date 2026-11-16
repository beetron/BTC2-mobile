import React from "react";
import { View, Text } from "react-native";
import { useTypeScale } from "../hooks/useTypeScale";
import ListRow from "./ListRow";

interface ListSectionProps {
  title?: string;
  // Element placed after the title (e.g. a count Badge)
  titleAccessory?: React.ReactNode;
  footer?: string;
  children: React.ReactNode;
}

// Card-grouped list section (Settings, Friends). Children are usually
// ListRow -- the first ListRow is told to skip its top divider.
const ListSection = ({ title, titleAccessory, footer, children }: ListSectionProps) => {
  const ts = useTypeScale();
  let index = 0;

  return (
    <View className="mb-6">
      {title ? (
        <View className="flex-row items-center gap-2 mx-1 mb-2">
          <Text className={`${ts.sectionHeader} text-inkMuted flex-shrink`}>{title}</Text>
          {titleAccessory}
        </View>
      ) : null}
      <View className="bg-surface border border-border rounded-[20px] overflow-hidden">
        {React.Children.map(children, (child) => {
          // Only ListRow takes isFirst (to skip its top divider)
          if (!React.isValidElement(child) || child.type !== ListRow) return child;
          const isFirst = index === 0;
          index += 1;
          return React.cloneElement(child as React.ReactElement<{ isFirst?: boolean }>, {
            isFirst,
          });
        })}
      </View>
      {footer ? (
        <Text className={`${ts.label} text-inkMuted mx-1.5 mt-2`}>{footer}</Text>
      ) : null}
    </View>
  );
};

export default ListSection;
