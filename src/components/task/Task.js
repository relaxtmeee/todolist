import './task.scss';

import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db, storage } from '../../services/database';
import { ref, getDownloadURL, deleteObject} from "firebase/storage";

/**
 * Компонент одного таска
 * @param {*} props Необходимые состояния
 */
const Task = (props) => {

    const {arr, task, setTask, setModalShow, setLoading, setId, setCheckbox} = props;
    const {header, date, description, file, checked, id} = arr;

    if (file) {
        getDownloadURL(ref(storage, file))
        .then((url) => {
          const link = document.getElementsByClassName(`${id}`);
          if (link[0]) link[0].setAttribute('href', url)
        })
        .catch((error) => {
            console.log(error);
        });
    }
    
    /**
     * Функция удаления таска
     */
    const delTask = async () => {
        setLoading(true);

        await deleteDoc(doc(db, "tasks", id));

        if (file) {
            const desertRef = ref(storage, file);
            deleteObject(desertRef).then(() => {

            }).catch((error) => {
                console.log(error);
            });
        }

        setTask(task => task.filter(item => item.id !== id))
        setLoading(false);
    }
    /**
     * Функция для показа модального окна с целью редактирования выбранного таска
     * @param {object} event ивент для установки id текущего таска модальному окну
     */
    const redTask = async (event) => {
        setModalShow();
        setId(id);
    }

    const fileDel = async () => {
        setLoading(true);
        const desertRef = ref(storage, file);
        deleteObject(desertRef);
        const washingtonRef = doc(db, "tasks", id);
        await updateDoc(washingtonRef, {
            file: null
        }).then(() => {
            const newarr = task.map(item => item.id !== id ? item : {id, header, description, date, file: null, checked});
            setTask([...newarr]);
            setLoading(false);
            setId(null);
        })
    }
    /**
     * Стили для просроченных и выполненных тасrов
     */
    let style = {
        'padding': '10px 10px',
        'border': '3px solid #6c757d',
        'boxShadow': '0 0 15px #6c757d',
        'borderRadius': '10px'
    }

    if (checked) {
        style = {
            'border': '3px solid green',
            'boxShadow': '0 0 15px green',
            'borderRadius': '10px',
            'padding': '10px 10px'
        }
    } else if (new Date().getTime() - 86400000 > new Date(date).getTime()) {
        style = {
            'border': '3px solid red',
            'boxShadow': '0 0 15px red',
            'borderRadius': '10px',
            'padding': '10px 10px'
        }
    }
    return (
        <>  
            <article id={id} style={style}>
                <h2>
                    {header}
                </h2>
                <div className="article-content" >
                    <div className="article-check">
                        <label className="article-checkbox" onClick={() => setCheckbox(id, task, checked)}>
                            <input type="checkbox" defaultChecked={checked}/>
                            <div className="article-checkbox__fake">
                            </div>
                        </label>
                        <time dateTime={new Date(date).toLocaleDateString()}>
                            {new Date(date).toLocaleDateString()}
                        </time>
                    </div>
                   
                    <div className="article-description">
                        {description}
                    </div>
                    <div className="article-buttons">
                        <button className="article-buttons__edit" onClick={redTask}>
                            Редактировать
                        </button>
                        <button className="article-buttons__delete" onClick={delTask}>
                            Удалить
                        </button>
                    </div>
                </div>
                {file ? 
                    <div className="article-file">
                        <div className="article-file__name">
                            Добавленный файл:
                        </div>
                        <div className='article-file__link'>
                            <a href="" download>{file}</a>
                        </div>
                        <div className="article-file__delete" onClick={fileDel}>
                            Удалить файл
                        </div>
                    </div>
                    : null
                }
            </article>
        </>
        
    );
}

export default Task;