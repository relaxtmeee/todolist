import './modal.scss'
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { collection, addDoc, updateDoc, doc} from "firebase/firestore"; 
import { db, storage } from '../../services/database';
import { ref, uploadBytes, deleteObject } from "firebase/storage";
/**
 *  Компонент модального окна
 */
const ModalWin = (props) => {
   
    const { id, task, setTask, setLoading, setId, onHide } = props;
     /**
     * Если модальное окно открывается для редактирования, получаем массив с обьектом соотвутствующего таска 
    */
    let arr = id ? task.filter(item => item.id === id): null;

    /**
     * Функция для отправки нового таска в базу данных
     * @param {string} header Заголовок таска
     * @param {string} description Описание таска
     * @param {number} date День создания таска
     * @param {file} file Прикрепленный файл
     * @param {string} name Название файла
     */
    async function sendTaskToDataBase(header, description, date, file, name) {
        props.setLoading(true)
        try {
            const docRef = await addDoc(collection(db, "tasks"), {
                header: header,
                description: description,
                date: date,
                file: name,
                checked: false
            })
            if (file) {
                const storageRef = ref(storage, name);
                uploadBytes(storageRef, file)
                    .then((snapshot) => {
                        setTask([...props.task, {'id': docRef.id, 'header': header, 'description': description, 'date': date, 'file': name, 'checked': false}]);
                        setLoading(false);
                         setId(null);
                    })
                    .catch(e => {
                        console.log(e);
                    })
            } else {
                setTask([...props.task, {'id': docRef.id, 'header': header, 'description': description, 'date': date, 'file': name, 'checked': false}]);
                setLoading(false);
                setId(null);    
            }
            

        } catch (e) {
            console.log(e);
        }
       
    }
    
    /**
     * Обновление существующего таска
     * @param {string} header Заголовок таска
     * @param {string} description Описание таска
     * @param {number} date День создания таска
     * @param {file} file Прикрепленный файл
     * @param {string} fileName Название старого файла, если он был
     * @param {string} taskName Название старого файла, если он был
     */
    const updateTask = async (header, description, date, file, fileName, taskName) => {

        setLoading(true);

        const name = (taskName && fileName) || !taskName ? fileName : taskName; 

        if (file && fileName !== taskName) {
            const storageRef = ref(storage, name);
            await uploadBytes(storageRef, file);
        } 
        if (file && taskName && fileName !== taskName) {
            const desertRef = ref(storage, taskName);
            deleteObject(desertRef)
        }

        const washingtonRef = doc(db, "tasks", id);
        await updateDoc(washingtonRef, {
            header: header, 
            description: description,
            date: date,
            file: name
        }).then(() => {
            const newarr = task.map(item => {
                return item.id !== id ? item : {id, header, description, date, file: name, checked: item.checked};
            });
            setTask(task => [...newarr]);
            setLoading(false);
            setId(null);
        })
    }

    /**
     * Функция для получения данных из полей модального окна и вызова создания или обновления таска
     * @param {object} event Передача ивента для проверки id у модального окна. Если id есть, откроется окно для обновления таска, если нет, то для создания нового
     */
    const addTask = (event) => {
        const bool = event.target.parentElement.hasAttribute('id') ? event.target.parentElement.hasAttribute('id') : false;

        const header = document.getElementById('header').value ? document.getElementById('header').value : 'Заголовок',
              description = document.getElementById('description').value ? document.getElementById('description').value : 'Описание',
              date = document.getElementById('date').value ? new Date(document.getElementById('date').value).getTime() : new Date().getTime(),
              file = document.getElementById('file').files[0] ? document.getElementById('file').files[0] : null;

        bool ? updateTask(header, description, date, file, file ? file.name : null, arr[0].file ? arr[0].file : null) : sendTaskToDataBase(header, description, date, file, file ? file.name : null);
        
        onHide();
    }  

    

    return (
        <div className='mod'>
            <Form id={arr ? arr[0].id : null}>
                <Form.Group className="mb-3">
                    <Form.Label>Заголовок</Form.Label>
                    <Form.Control id='header' type="text" defaultValue={arr ? arr[0].header : null} required/>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Описание</Form.Label>
                    <Form.Control id='description' type="text" defaultValue={arr ? arr[0].description : null} required/>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>До какого числа планируете сделать</Form.Label>
                    <Form.Control id='date' type="date" defaultValue={arr ? new Date(arr[0].date).toLocaleDateString('en-ca') : null} required/>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>{arr ? 'Выбрать другой файл или оставить прошлый': 'Добавьте файл, если надо'}</Form.Label>
                    <Form.Control id='file' type="file" required/>
                </Form.Group>
                <Button className="mr-2"onClick={addTask} variant="primary">
                    {arr ? 'Сохранить' : 'Добавить'} 
                </Button>
                <Button className="ml-3" onClick={() => {
                    onHide();
                    setId(null);
                    }}
                variant="danger">
                    Закрыть
                </Button>
            </Form>
        </div>
    )
}

export default ModalWin;