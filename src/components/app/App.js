import Header from "../header/Header";
import Tasks from "../tasks/Tasks";
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {

    return (
        <div className="app">
            <Header/>
            <Tasks/>
        </div>
    )

   
}

export default App;