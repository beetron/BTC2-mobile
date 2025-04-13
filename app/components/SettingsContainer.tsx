import { View, Text } from 'react-native'
import React from 'react'
import SettingsProfilePhoto from './SettingsProfilePhoto'

const SettingsContainer = () => {
  return (
    <View className="flex bg-btc500 h-full w-full p-4">
      <Text className="items-center text-btc100 text-2xl font-funnel-regular">User Settings</Text>
      <View className="flex-row">
        <SettingsProfilePhoto />
      </View>
    </View>
  )
}

export default SettingsContainer