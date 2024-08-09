import React from "react";
import { GateContext } from "../context/GateContext/gate-context";

export const useGate = () => {
    return React.useContext(GateContext);
};
