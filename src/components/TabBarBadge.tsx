import { View, Text } from "react-native";

interface TabBarBadgeProps {
  count: number;
}

const TabBarBadge = ({ count }: TabBarBadgeProps) => {
  if (count <= 0) return null;

  return (
    <View className="absolute -top-1 -right-1.5 bg-danger rounded-full min-w-[16px] h-4 px-1 items-center justify-center">
      <Text className="text-btc100 text-[10px] font-funnel-semi-bold">
        {count > 9 ? "9+" : count}
      </Text>
    </View>
  );
};

export default TabBarBadge;
