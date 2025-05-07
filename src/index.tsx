import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppUiProvider } from "@canva/app-ui-kit";
import App from "./components/App";
import "@canva/app-ui-kit/styles.css";

// 创建React Query客户端
const queryClient = new QueryClient();

const container = document.getElementById("root");
const root = createRoot(container!);

// 渲染应用
root.render(
  <React.StrictMode>
    <AppUiProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </AppUiProvider>
  </React.StrictMode>
);

if (module.hot) {
  module.hot.accept("./components/App", () => {
    root.render(
      <React.StrictMode>
        <AppUiProvider>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </AppUiProvider>
      </React.StrictMode>
    );
  });
}
