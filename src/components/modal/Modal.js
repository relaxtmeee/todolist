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
     * @param {file} files Прикрепленный файл
     * @param {string} filesName Название файлов
     */
    async function sendTaskToDataBase(header, description, date, files, filesName) {
        setLoading(true)
        try {
            const docRef = await addDoc(collection(db, "tasks"), {
                header: header,
                description: description,
                date: date,
                filesName: filesName,
                checked: false
            })
            if (files) {
                for (let i = 0; i < files.length; i++) {
                    const storageRef = ref(storage, files[i].name);
                    await uploadBytes(storageRef, files[i])
                    .then((snapshot) => {

                    })
                    .catch(e => {
                        console.log(e);
                    })
                }
                setTask([...props.task, {'id': docRef.id, 'header': header, 'description': description, 'date': date, 'filesName': filesName, 'checked': false}]);
                setLoading(false);
                setId(null);
            } else {
                setTask([...props.task, {'id': docRef.id, 'header': header, 'description': description, 'date': date, 'filesName': filesName, 'checked': false}]);
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
     */
    const updateTask = async (header, description, date) => {

        setLoading(true);

        const washingtonRef = doc(db, "tasks", id);
        await updateDoc(washingtonRef, {
            header: header, 
            description: description,
            date: date
        }).then(() => {
            const newarr = task.map(item => {
                return item.id !== id ? item : {id, header, description, date, filesName: task[0].filesName, checked: item.checked};
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
              files = document.getElementById('file') && !bool ? document.getElementById('file').files : null;

        let filesName = []
        if (files && files.length !== 0) {
            for (let i = 0; i < files.length; i++) {
                filesName.push(files[i].name)
            }
        }

        bool ? updateTask(header, description, date) : sendTaskToDataBase(header, description, date, files, files ? filesName: null);
        
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
                { arr ? null 
                    : 
                    <Form.Group className="mb-3">
                        <Form.Label>
                            Добавьте файл, если надо
                        </Form.Label>
                        <Form.Control id='file' type="file" multiple/>
                    </Form.Group>
                }
                 <Button className="mr-2"onClick={addTask} variant="primary">
                    {arr ? 'Сохранить' : 'Добавить'}
                </Button>
                <Button className="ml-3" onClick={() => {
                    onHide();
                    setId(null);
                    }}
                    variant="danger"
                >
                    {arr ? 'Отменить' : 'Закрыть'}
                </Button>
               
            </Form>
        </div>
    )
}

export default ModalWin;