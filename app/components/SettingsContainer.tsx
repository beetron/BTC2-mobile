import { View, Text } from 'react-native'
import React from 'react'
import SettingsProfileImage from './SettingsProfileImage'

const SettingsContainer = () => {
  return (
    <View className="flex bg-btc500 h-full w-full p-4">
      <Text className="items-center text-btc100 text-2xl font-funnel-regular">User Settings</Text>
      <View className="flex-row">
        <SettingsProfileImage />
      </View>
    </View>
  )
}

export default SettingsContainer