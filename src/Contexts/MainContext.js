import React from "react";

export default React.createContext({
  theme: "dark",
  toggleTheme: () => {},
  data: undefined,
  setData: (data) => {},
  redirectTo: (where, reason) => {}
});