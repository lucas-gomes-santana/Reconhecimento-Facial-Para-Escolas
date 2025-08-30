import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from "./pages/HomePage";
import Cadastro from "./pages/Cadastrar";
import Estatisticas from "./pages/Estatisticas";
import Verificacao from './pages/Verificacao';


function App() {
    return (
        <Router>
            <div>
                <main>
                    <Routes>
                        <Route path="/" element={<Navigate to={"/home"}/>}/>    
                        <Route path="/home" element={<HomePage />} />
                        <Route path='/cadastro' element={<Cadastro/>}/>
                        <Route path='/estatisticas' element={<Estatisticas/>}/>
                        <Route path='/verificacao' element={<Verificacao/>}></Route>
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
