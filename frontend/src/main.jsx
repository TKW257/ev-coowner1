import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import { ConfigProvider } from "antd";
import store from "./app/store"; 
import "./index.css";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
        <ConfigProvider>
          <App />
        </ConfigProvider>
    </Provider>
  </React.StrictMode>
);


//progarm run from main
//B1: find tag name: root
//B2: render