import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ConfiguracionSistemaProvider } from "./componentes/sistema/ConfiguracionSistemaContext.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { FiltrosProvider } from "./context/filtros-contesxt.tsx";
import { CatalogosProvider } from "./context/catalogos-context.tsx";


createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId="280494856685-dc4j4agtrcdul6rt6568d3mc9lnisbnq.apps.googleusercontent.com">
    <StrictMode>
      <ConfiguracionSistemaProvider>
        <FiltrosProvider>
          <CatalogosProvider>
            <App />
          </CatalogosProvider>
        </FiltrosProvider>
      </ConfiguracionSistemaProvider>
    </StrictMode>
  </GoogleOAuthProvider>
);