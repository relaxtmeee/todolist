import { useEffect, useState } from "react";
import Task from "../task/Task";
import Button from 'react-bootstrap/Button';
import ModalWin from "../modal/Modal";
import { collection, getDocs, doc, updateDoc} from "firebase/firestore"; 
import { db } from '../../services/database';
import Spinner from "../spinner/Spinner";

/**
 * Компонент со всеми тасками
 */
const Tasks = () => {

    const [task, setTask] = useState([]);
    const [id, setId] = useState()
    const [loading, setLoading] = useState(false)
    const [modalShow, setModalShow] = useState(false);

 
    useEffect(() => {
        setLoading(true);
        async function getData () {
            const querySnapshot = await getDocs(collection(db, "tasks"));
            let arr = [];
            querySnapshot.forEach((doc) => {
                arr.push({id: doc.id,header: doc.data().header, description: doc.data().description, date: doc.data().date, file: doc.data().file, checked: doc.data().checked})
            });
            setTask([...arr]);
            setLoading(false);
        }
        getData();
    }, [])
 
    /**
     * Функция установки состояния checked для выбранного таска
     * @param {*} id id текущего таска для обновления состояния выполнения таска в бд 
     * @param {*} task Массив тасков для обновления состояния
     */
    const setCheckbox = async (id, task, checked) => {
        setLoading(true)

        const check = !checked;

        const washingtonRef = doc(db, "tasks", id);

        await updateDoc(washingtonRef, {
            checked: check
        }).then(() => {
            const newarr = task.map(item => item.id !== id ? item : {id, header: item.header, description: item.description, date: item.date, file: item.file, checked: check});
            setTask([...newarr]);
        });

        setLoading(false)
    }
    /**
    * Объект верстки с всеми тасками
    */
    const items = task ? task.map((el, i) => {
        return (
            <Task
                key={el.id} 
                arr={el}
                task={task}
                setTask={setTask}
                setLoading={setLoading}
                setModalShow={() => setModalShow(true)}
                setId={setId}
                setCheckbox={setCheckbox}
            />
        )
    }) : null


    return (
        <>
            <Button className="mt-2 mb-3" variant="primary" onClick={() => setModalShow(true)}>
                Добавить заметку
            </Button>
            {modalShow ? 
                <ModalWin 
                    onHide={() => setModalShow(false)}
                    task={task}
                    setTask={setTask}
                    setModalShow={() => setModalShow(false)}
                    setLoading={setLoading}
                    id={id ? id : null}
                    setId={setId}
                    />: null}
            {loading ? <Spinner/> : items}
        </>
    )
}


export default Tasks;