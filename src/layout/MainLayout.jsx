import NavBar from "../components/NavBar/NavBar";
import Pegaze from "./../components/Pegaze/Pegaze";

export default function MainLayout({ children }) {
    return (
        <>
            <NavBar />

            <main style={{ marginTop: "30px" }}>{children}</main>

            <Pegaze />
        </>
    );
}
