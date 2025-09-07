import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from "./pages/HomePage";
import Cadastro from "./pages/Cadastrar";
import Estatisticas from "./pages/Estatisticas";
import Verificacao from './pages/Verificacao';
import Login from './pages/Login';
import UserManegement from './pages/UserManagement';
import AdminPage from './pages/AdminPage';


function App() {
    return (
        <Router>
            <div>
                <main>
                    <Routes>
                        <Route path="/" element={<Navigate to={"/login"}/>}/>    
                        <Route path='/login' element={<Login />}></Route>
                        <Route path="/home" element={<HomePage />} />
                        <Route path='/cadastro' element={<Cadastro/>}/>
                        <Route path='/estatisticas' element={<Estatisticas/>}/>
                        <Route path='/verificacao' element={<Verificacao/>}></Route>
                        <Route path='/gerenciar-usuarios' element={<UserManegement/>}></Route>
                        <Route path='/pagina-do-admin' element={<AdminPage/>}></Route>
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
