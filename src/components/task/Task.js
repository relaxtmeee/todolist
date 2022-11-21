import './task.scss';

import { Form } from 'react-bootstrap';
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db, storage } from '../../services/database';
import { ref, getDownloadURL, deleteObject, uploadBytes} from "firebase/storage";
import { useEffect, useState } from 'react';

/**
 * Компонент одного таска
 * @param {*} props Необходимые состояния
 */
const Task = (props) => {

    const {arr, task, setTask, setModalShow, setLoading, setId, setCheckbox} = props;
    const {header, date, description, filesName, checked, id} = arr;

    /**
     * Функция удаления таска
     */
    const delTask = async () => {
        setLoading(true);
        await deleteDoc(doc(db, "tasks", id));
        if (filesName) {
            filesName.map(item => {
                const desertRef = ref(storage, item);
                deleteObject(desertRef).then(() => {
                }).catch((error) => {
                    console.log(error);
                });
            })
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

    const fileDel = async (item) => {
        setLoading(true);
        const desertRef = ref(storage, item);
        deleteObject(desertRef);
        const washingtonRef = doc(db, "tasks", id);
        await updateDoc(washingtonRef, {
            filesName: filesName.filter(file => item != file)
        }).then(() => {
            const newNames = filesName.filter(file => item != file)
            const newarr = task.map(item => item.id !== id ? item : {id, header, description, date, filesName: newNames, checked});
            setTask(() => [...newarr]);
            setLoading(false);
            setId(null);
        })
    }

    const addFile = async () => {
        const files = document.getElementById('add-' + id).files[0] ? document.getElementById('add-' + id).files : null;

        if(files !== null) {
            setLoading(true);
            let newNames = [];
            for (let i = 0; i < files.length; i++) {
                const newFilesName = filesName.filter(item => item !== files[i].name)
                if (newFilesName.length == filesName.length) {
                    const storageRef = ref(storage, files[i].name);
                    await uploadBytes(storageRef, files[i])
                    .then((snapshot) => {

                    })
                    .catch(e => {
                        console.log(e);
                    })
                    newNames.push(files[i].name);
                }
            }
            if (newNames.length > 0) {
                const washingtonRef = doc(db, "tasks", id);
                await updateDoc(washingtonRef, {
                    filesName: [...filesName, ...newNames]
                }).then(() => {
                    // const names = [...filesName, ...newNames];
                    const newarr = task.map(item => {
                        return item.id !== id ? item : {id, header, description, date, filesName: [...filesName, ...newNames], checked: item.checked};
                    });
                    setTask(task => [...newarr]);
                })
            }
            setLoading(false);
        }
        
    }

    const filesBlock = filesName ? filesName.map(item => {
        getDownloadURL(ref(storage, item))
        .then((url) => {
            document.getElementById(id + item).setAttribute('href', url);
        })
        .catch((error) => {
            console.log(error);
        })

        return (
            <div className="article-file">
                <div className="article-file__name">
                    Добавленный файл:
                </div>
                <div className='article-file__link'>
                    <a id={id + item} href='' download>{item.length > 20 ? item.slice(0, 20) + '...' : item}</a>
                </div>
                <div className="article-file__delete" onClick={() => fileDel(item)}>
                    Удалить файл
                </div>
            </div>
        )
    }) : null;

  
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
                {filesBlock}
                <div className="article-file__add">
                    <Form.Control type='file' id={'add-' + id} className="article-file__add-input" multiple/>
                    <button className="article-file__add-button" onClick={addFile}>
                        Добавить файл(ы)
                    </button>
                </div>
               
                
            </article>
        </>
        
    );
}

export default Task;