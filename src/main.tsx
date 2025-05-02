import React from "react";
import { createRoot } from "react-dom/client";
import { Application } from "./src/modules/app/application";

createRoot(document.getElementById("root")!).render(<Application />);
