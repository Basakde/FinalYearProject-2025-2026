import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
export default function PlaceholderOneScreen() {
     const [message, setMessage] = useState("");

     const onPressHandler = () => {
        fetch("http://192.168.0.12:8000/")
            .then((response) => response.json())
            .then((data) => setMessage(data.message))
            .catch((error) => console.error(error));
     }
        /*useEffect(() => {
            fetch("http://192.168.0.12:8000/")
            .then((response) => response.json())
            .then((data) => setMessage(data.message))
            .catch((error) => console.error(error));
        }, []);*/

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <TouchableOpacity onPress={onPressHandler}>
            <Text>Here</Text>
        </TouchableOpacity>
      {message && (<Text>{message}</Text>)}
    </View>
  );
}

