import './task.scss';

import { doc, deleteDoc } from "firebase/firestore";
import { db, storage } from '../../services/database';
import { ref, getDownloadURL, deleteObject} from "firebase/storage";

/**
 * Компонент одного таска
 * @param {*} props Необходимые состояния
 */
const Task = (props) => {

    const {header, date, description, file, checked, id} = props.arr;
    const {task, setTask, setModalShow, setLoading, setId, setCheckbox} = props;

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

        setTask((task) => {
            return task.filter(item => item.id !== id);
        })
        setLoading(false);
    }
    /**
     * Функция для показа модального окна с целью редактирования выбранного таска
     * @param {object} event ивент для установки id текущего таска модальному окну
     */
    const redTask = async (event) => {
        setModalShow();
        setId(event.target.parentElement.parentElement.getAttribute('id'));
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
            'borderRadius': '10px',
            'padding': '10px 10px',
            'boxShadow': '0 0 15px green'
        }
    } else if (new Date().getTime() - 86400000 > new Date(date).getTime()) {
        style = {
            'border': '3px solid red',
            'borderRadius': '10px',
            'padding': '10px 10px',
            'boxShadow': '0 0 15px red'
        }
    }
    return (
        <>  
            {/* <div className="separator">
            
            </div>
            <InputGroup id={id} className="mb-3">
                <InputGroup className="mb-3">
                    <Form.Label>
                        <h4>{header}</h4>
                    </Form.Label>
                </InputGroup>
                <InputGroup style={style} className="mb-3">
                    <InputGroup.Checkbox defaultChecked={checked} onClick={(event) => setCheckbox(event, id, task)} aria-label="Checkbox for following text input" />
                    <Button variant="secondary">{new Date(date).toLocaleDateString()}</Button>
                    <Form.Control aria-label="Text input with checkbox" defaultValue={`${description}`}/>
                    <Button onClick={redTask} variant="secondary">Редактировать</Button>
                    <Button onClick={delTask} variant="danger">Удалить</Button>
                </InputGroup>
                {file ? 
                    <Form.Group className="mb-3">
                        <Form.Label>Добавленный файл</Form.Label>
                            <div>
                                <a className={id} href="" download>{file}</a>
                            </div>
                    </Form.Group> 
                    : null
                }
              
            </InputGroup> */}
            <article id={id} style={style}>
                <h2>
                    {header}
                </h2>
                <div className="article-content" >
                    <div className="article-check">
                        <label className="article-checkbox" onClick={(event) => setCheckbox(event, id, task, checked)}>
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
                        <a className={'article-file__link ' + id} href="" download>{file}</a>
                    </div>
                    : null
                }
            </article>
        </>
        
    );
}

export default Task;