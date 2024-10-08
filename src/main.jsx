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
import KptureReport from "./pages/KptureReport/KptureReport";
import { ThemeProvider } from "./context/ThemeContext/ThemeContext";
import KptureUsers from "./pages/KptureUsers/KtpureUsers";

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

    { path: "/notes", element: <Notes /> },
    { path: "/cours", element: <Notes /> },
    { path: "/article", element: <Notes /> },

    { path: "/kptureadmin", element: <DomainGestion /> },
    { path: "/kpturereport", element: <KptureReport /> },
    { path: "/kptureusers", element: <KptureUsers /> },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
    <GateProvider>
        <ChatInstanceProvider>
            <RouterProvider router={router} />
        </ChatInstanceProvider>
    </GateProvider>
);
