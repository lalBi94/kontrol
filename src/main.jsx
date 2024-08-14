import React from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { GateProvider } from "./context/GateContext/gate-context";
import Home from "./pages/Home/Home";
import Storage from "./pages/Storage/Storage";
import { ChatInstanceProvider } from "./context/ChatInstance/ChatInstance";
import Galery from "./pages/Galery/Galery";
import Chat from "./pages/Chat/Chat";
import DomainGestion from "./pages/DomainGestion/DomainGestion";
import Notes from "./pages/Notes/Notes";

const router = createBrowserRouter([
    { path: "*", element: <Home /> },
    { path: "/home", element: <Home /> },
    { path: "/accueil", element: <Home /> },

    { path: "/storage", element: <Storage /> },
    { path: "/stockage", element: <Storage /> },

    { path: "/galery/:album", element: <Galery /> },
    { path: "/galerie/:album", element: <Galery /> },
    { path: "/galery", element: <Galery /> },
    { path: "/galerie", element: <Galery /> },

    { path: "/chat", element: <Chat /> },
    { path: "/messagerie", element: <Chat /> },

    { path: "/kptureadmin", element: <DomainGestion /> },
    { path: "/notes", element: <Notes /> },
]);

console.log(import.meta.env);

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <GateProvider>
            <ChatInstanceProvider>
                <RouterProvider router={router} />
            </ChatInstanceProvider>
        </GateProvider>
    </React.StrictMode>
);
