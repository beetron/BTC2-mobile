import { useEffect } from "react";
import friendStore from "../zustand/friendStore";
import { getSocket } from "./useSocket";
import { Socket } from "socket.io-client";

const useSocketNewMessages = () => {
  const { setShouldRender } = friendStore();

  useEffect(() => {
    const socket: Socket | null = getSocket();

    if (!socket) {
      console.log("No socket connection available");
      return;
    }

    console.log("Setting up newMessageSignal listener");

    // Add explicit event handler function
    const handleNewMessage = () => {
      console.log("New Message Signal Received");
      setShouldRender();
    };

    socket.on("newMessageSignal", handleNewMessage);

    // Debug: List all listeners
    console.log(
      "Current socket listeners:",
      socket.listeners("newMessageSignal")
    );

    return () => {
      console.log("Cleaning up newMessageSignal listener");
      socket.off("newMessageSignal", handleNewMessage);
    };
  }, []);
};

export default useSocketNewMessages;

// import { useEffect } from "react";
// import friendStore from "../zustand/friendStore";
// import { getSocket } from "./useSocket";
// import { Socket } from "socket.io-client";

// const useSocketNewMessages = () => {
//   const { setShouldRender } = friendStore();

//   useEffect(() => {
//     const socket: Socket | null = getSocket();
//     socket?.on("newMessageSignal", () => {
//       console.log("New Message Signal Received");
//       setShouldRender();
//     });

//     return () => {
//       socket?.off("newMessageSignal");
//     };
//   }, []);
// };

// export default useSocketNewMessages;
