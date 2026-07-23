import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const asArray = (c) => (Array.isArray(c) ? c : [c]);

const eslintConfig = [
  ...asArray(coreWebVitals),
  ...asArray(typescript),
  {
    ignores: [".next/**", "node_modules/**", "data/**", "drizzle/**"],
  },
  {
    rules: {
      // Sincronizar con el DOM externo (tema) o fijar estado de error desde
      // callbacks de hls.js son usos legítimos; los dejamos como aviso.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default eslintConfig;
