import React from 'react';
import { View, Text, Button } from 'react-native';
import GenerateMessage from "./GenerateMessage";


function AppContent() {
    const filename = "talk.txt";
    const generateMessage = new GenerateMessage("filepath");
    console.log("message: ", generateMessage.getGeneratedMessage("exact name of sender"));

    return (
        <View>
            <Text>Hello, World!</Text>
        </View>
    )
}

export default AppContent;
